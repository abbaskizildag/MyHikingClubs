import { Request, Response } from 'express';
import { EventService } from '../services/eventService';
import { ClubService } from '../services/clubService';
import { AuthRequest } from '../middleware/authMiddleware';

const eventService = new EventService();
const clubService = new ClubService();

export class EventController {
  async getAllEvents(req: Request, res: Response) {
    try {
      const events = await eventService.getAllEvents();
      
      const enrichedEvents = events.map(event => {
        const confirmedCount = event.attendees.filter(a => a.status === 'CONFIRMED').length;
        const waitlistCount = event.attendees.filter(a => a.status === 'WAITLISTED').length;
        
        return {
          ...event,
          confirmedCount,
          waitlistCount,
          isFull: confirmedCount >= event.capacity
        };
      });

      res.json(enrichedEvents);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getEventById(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const event = await eventService.getEventById(id);
      
      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }

      const confirmedCount = event.attendees.filter(a => a.status === 'CONFIRMED').length;
      const waitlistCount = event.attendees.filter(a => a.status === 'WAITLISTED').length;

      res.json({
        ...event,
        confirmedCount,
        waitlistCount,
        isFull: confirmedCount >= event.capacity
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async joinEvent(req: AuthRequest, res: Response) {
    try {
      const id = req.params.id as string;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const result = await eventService.joinEvent(id, userId);
      res.json({ success: true, status: result.status });
    } catch (error: any) {
      console.error(error);
      res.status(400).json({ error: error.message || 'Error joining event' });
    }
  }

  async leaveEvent(req: AuthRequest, res: Response) {
    try {
      const id = req.params.id as string;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      await eventService.leaveEvent(id, userId);
      res.json({ success: true, message: 'Successfully left event' });
    } catch (error: any) {
      console.error(error);
      res.status(400).json({ error: error.message || 'Error leaving event' });
    }
  }

  async createEvent(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ error: 'Authentication required' });
      
      const { leaderIds, ...data } = req.body;
      const clubId = data.clubId;

      // Check Authorization
      const userRole = await clubService.getMemberRole(clubId, userId);
      if (userRole !== 'ADMIN' && userRole !== 'LEADER') {
        return res.status(403).json({ error: 'Only club admins or leaders can create events' });
      }
      
      const finalLeaderIds = leaderIds && leaderIds.length > 0 ? leaderIds : [userId];

      const event = await eventService.createEvent({
        ...data,
        leaderIds: finalLeaderIds
      });
      res.status(201).json(event);
    } catch (error: any) {
      console.error(error);
      res.status(400).json({ error: error.message || 'Failed to create event' });
    }
  }

  async updateEvent(req: AuthRequest, res: Response) {
    try {
      const eventId = req.params.id as string;
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ error: 'Authentication required' });

      const event = await eventService.getEventById(eventId);
      if (!event) return res.status(404).json({ error: 'Event not found' });

      // Check Authorization
      const userRole = await clubService.getMemberRole(event.clubId, userId);
      if (userRole !== 'ADMIN' && userRole !== 'LEADER') {
        return res.status(403).json({ error: 'Only club admins or leaders can update events' });
      }

      const updated = await eventService.updateEvent(eventId, req.body);
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Failed to update event' });
    }
  }
}
