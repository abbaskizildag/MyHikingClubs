import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { prisma } from '../db';

const authService = new AuthService();

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const result = await authService.register(req.body);
      res.status(201).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const result = await authService.login(req.body);
      res.json(result);
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  }

  async me(req: any, res: Response) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        select: { 
          id: true, 
          email: true, 
          name: true, 
          role: true,
          clubs: {
            include: {
              club: {
                include: {
                  _count: {
                    select: { members: true, events: true }
                  }
                }
              }
            }
          },
          attendees: {
            include: {
              event: {
                include: {
                  club: true,
                  city: { include: { country: true } }
                }
              }
            },
            orderBy: {
              event: {
                date: 'desc'
              }
            }
          }
        }
      });
      res.json({ user });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch user' });
    }
  }

  async updateMe(req: any, res: Response) {
    const { name, email } = req.body;
    try {
      const user = await prisma.user.update({
        where: { id: req.user.userId },
        data: { name, email },
        select: { id: true, email: true, name: true, role: true }
      });
      res.json({ user });
    } catch (error: any) {
      if (error.code === 'P2002') {
        return res.status(400).json({ error: 'Email already in use' });
      }
      res.status(500).json({ error: 'Failed to update profile' });
    }
  }
}
