import { prisma } from '../db';

export class ClubService {
  async getAllClubs() {
    return prisma.club.findMany({
      include: {
        events: true,
        city: {
          include: { country: true }
        }
      }
    });
  }

  async getClubById(id: string) {
    return prisma.club.findUnique({
      where: { id },
      include: {
        events: {
          include: {
            attendees: true,
            city: true
          },
          orderBy: { date: 'asc' }
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          }
        },
        city: {
          include: { country: true }
        }
      }
    });
  }

  async createClub(data: { name: string; description: string; cityId?: string }, creatorId: string) {
    return prisma.$transaction(async (tx) => {
      const club = await tx.club.create({ 
        data: {
          ...data,
          cityId: data.cityId || null
        } 
      });
      // Creator becomes ADMIN
      await tx.clubMember.create({
        data: {
          clubId: club.id,
          userId: creatorId,
          role: 'ADMIN'
        }
      });
      return club;
    });
  }

  async joinClub(clubId: string, userId: string) {
    return prisma.clubMember.create({
      data: {
        clubId,
        userId,
        role: 'MEMBER'
      }
    });
  }

  async getClubMembers(clubId: string) {
    return prisma.clubMember.findMany({
      where: { clubId },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    });
  }

  async getMemberRole(clubId: string, userId: string) {
    const membership = await prisma.clubMember.findUnique({
      where: { clubId_userId: { clubId, userId } }
    });
    return membership?.role || null;
  }

  async updateMemberRole(clubId: string, targetUserId: string, newRole: 'MEMBER' | 'LEADER' | 'ADMIN') {
    return prisma.clubMember.update({
      where: { clubId_userId: { clubId, userId: targetUserId } },
      data: { role: newRole }
    });
  }

  async updateClub(id: string, data: { name?: string; description?: string; cityId?: string }) {
    return prisma.club.update({
      where: { id },
      data: {
        ...data,
        cityId: data.cityId || null
      }
    });
  }
}
