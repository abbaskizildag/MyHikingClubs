import { Request, Response } from 'express';
import { ClubService } from '../services/clubService';

const clubService = new ClubService();

export class ClubController {
  async getAllClubs(req: Request, res: Response) {
    try {
      const clubs = await clubService.getAllClubs();
      res.json(clubs);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch clubs' });
    }
  }

  async getClubById(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const club = await clubService.getClubById(id);
      if (!club) return res.status(404).json({ error: 'Club not found' });
      res.json(club);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch club' });
    }
  }

  async createClub(req: any, res: Response) {
    try {
      const { name, description, cityId } = req.body;
      const userId = req.user.userId;
      if (!name) return res.status(400).json({ error: 'Name is required' });
      
      const club = await clubService.createClub({ name, description, cityId }, userId);
      res.status(201).json(club);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create club' });
    }
  }

  async joinClub(req: any, res: Response) {
    try {
      const clubId = req.params.id as string;
      const userId = req.user.userId;
      
      const membership = await clubService.joinClub(clubId, userId);
      res.status(201).json(membership);
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Failed to join club' });
    }
  }

  async getMembers(req: Request, res: Response) {
    try {
      const clubId = req.params.id as string;
      const members = await clubService.getClubMembers(clubId);
      res.json(members);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch members' });
    }
  }

  async updateMemberRole(req: any, res: Response) {
    try {
      const clubId = req.params.id as string;
      const requesterId = req.user.userId;
      const { targetUserId, newRole } = req.body;

      // Check if requester is ADMIN of the club
      const requesterRole = await clubService.getMemberRole(clubId, requesterId);
      if (requesterRole !== 'ADMIN') {
        return res.status(403).json({ error: 'Only club admins can update roles' });
      }

      const updated = await clubService.updateMemberRole(clubId, targetUserId, newRole);
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Failed to update role' });
    }
  }

  async updateClub(req: any, res: Response) {
    try {
      const clubId = req.params.id as string;
      const userId = req.user.userId;
      const { name, description, cityId } = req.body;
      
      console.log(`Update request for club ${clubId} by user ${userId}`);

      const userRole = await clubService.getMemberRole(clubId, userId);
      console.log(`User role in club: ${userRole}`);
      
      if (userRole !== 'ADMIN' && userRole !== 'LEADER') {
        return res.status(403).json({ error: 'Not authorized to edit this club' });
      }

      const updated = await clubService.updateClub(clubId, { name, description, cityId });
      res.json(updated);
    } catch (error: any) {
      console.error('Club update failed:', error);
      res.status(400).json({ error: error.message || 'Failed to update club' });
    }
  }
}
