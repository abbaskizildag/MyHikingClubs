import { prisma } from '../db';
import { AttendeeStatus } from '@prisma/client';

export class EventService {
  async getAllEvents() {
    return prisma.event.findMany({
      include: {
        club: true,
        city: {
          include: { country: true }
        },
        attendees: {
          include: {
            user: { select: { id: true, name: true } }
          }
        },
        leaders: {
          include: {
            user: {
              select: { id: true, name: true, role: true }
            }
          }
        }
      },
      orderBy: {
        date: 'asc'
      }
    });
  }

  async getEventById(eventId: string) {
    return prisma.event.findUnique({
      where: { id: eventId },
      include: {
        club: {
          include: {
            members: true
          }
        },
        city: {
          include: { country: true }
        },
        attendees: {
          include: {
            user: { select: { id: true, name: true, email: true } }
          },
          orderBy: { createdAt: 'asc' }
        },
        leaders: {
          include: {
            user: {
              select: { id: true, name: true, role: true }
            }
          }
        }
      }
    });
  }

  async joinEvent(eventId: string, userId: string) {
    return prisma.$transaction(async (tx: any) => {
      const event = await tx.event.findUnique({
        where: { id: eventId },
        include: { attendees: true }
      });

      if (!event) {
        throw new Error('Event not found');
      }

      const existingAttendee = event.attendees.find((a: any) => a.userId === userId);
      if (existingAttendee) {
        throw new Error('User is already registered for this event');
      }

      const confirmedCount = event.attendees.filter((a: any) => a.status === AttendeeStatus.CONFIRMED).length;
      const status = confirmedCount < event.capacity ? AttendeeStatus.CONFIRMED : AttendeeStatus.WAITLISTED;

      const newAttendee = await tx.eventAttendee.create({
        data: {
          eventId,
          userId,
          status,
        }
      });

      return newAttendee;
    });
  }

  async leaveEvent(eventId: string, userId: string) {
    return prisma.$transaction(async (tx: any) => {
      const attendee = await tx.eventAttendee.findUnique({
        where: {
          eventId_userId: { eventId, userId }
        }
      });

      if (!attendee) {
        throw new Error('User is not registered for this event');
      }

      // If a leader tries to leave, we might want to prevent it or just remove from attendees
      // For now, let's allow leaving

      await tx.eventAttendee.delete({
        where: { id: attendee.id }
      });

      if (attendee.status === AttendeeStatus.CONFIRMED) {
        const firstWaitlisted = await tx.eventAttendee.findFirst({
          where: {
            eventId,
            status: AttendeeStatus.WAITLISTED
          },
          orderBy: {
            createdAt: 'asc'
          }
        });

        if (firstWaitlisted) {
          await tx.eventAttendee.update({
            where: { id: firstWaitlisted.id },
            data: { status: AttendeeStatus.CONFIRMED }
          });
        }
      }

      return { success: true };
    });
  }

  async createEvent(data: any) {
    const { leaderIds, ...eventData } = data;
    const uniqueLeaderIds = Array.from(new Set(leaderIds)) as string[];
    
    return prisma.$transaction(async (tx: any) => {
      const event = await tx.event.create({
        data: {
          title: eventData.title,
          description: eventData.description,
          date: new Date(eventData.date),
          clubId: eventData.clubId,
          cityId: eventData.cityId || null,
          capacity: parseInt(eventData.capacity),
          difficultyLevel: eventData.difficultyLevel,
          priceDetails: eventData.priceDetails || {},
          leaders: {
            create: uniqueLeaderIds.map((userId: string) => ({
              userId
            }))
          }
        }
      });

      // Auto-add leaders as confirmed attendees
      for (const userId of uniqueLeaderIds) {
        await tx.eventAttendee.upsert({
          where: { eventId_userId: { eventId: event.id, userId } },
          update: { status: 'CONFIRMED' },
          create: {
            eventId: event.id,
            userId,
            status: 'CONFIRMED'
          }
        });
      }

      return event;
    });
  }

  async updateEvent(eventId: string, data: any) {
    const { leaderIds, ...eventData } = data;
    const uniqueLeaderIds = leaderIds ? Array.from(new Set(leaderIds)) as string[] : null;

    return prisma.$transaction(async (tx: any) => {
      const updated = await tx.event.update({
        where: { id: eventId },
        data: {
          title: eventData.title,
          description: eventData.description,
          date: eventData.date ? new Date(eventData.date) : undefined,
          capacity: eventData.capacity ? parseInt(eventData.capacity) : undefined,
          difficultyLevel: eventData.difficultyLevel,
          cityId: eventData.cityId || null,
          priceDetails: eventData.priceDetails
        }
      });

      if (uniqueLeaderIds) {
        await tx.eventLeader.deleteMany({ where: { eventId } });
        await tx.eventLeader.createMany({
          data: uniqueLeaderIds.map((userId: string) => ({
            eventId,
            userId
          }))
        });

        // Ensure current leaders are confirmed attendees
        for (const userId of uniqueLeaderIds) {
          await tx.eventAttendee.upsert({
            where: { eventId_userId: { eventId, userId } },
            update: { status: 'CONFIRMED' },
            create: {
              eventId,
              userId,
              status: 'CONFIRMED'
            }
          });
        }
      }

      return updated;
    });
  }
}
