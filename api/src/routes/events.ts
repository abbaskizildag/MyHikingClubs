import { Router } from 'express';
import { EventController } from '../controllers/eventController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();
const eventController = new EventController();

// IMPORTANT: Need to use .bind to maintain "this" context if using class methods directly
router.get('/', eventController.getAllEvents.bind(eventController));
router.get('/:id', eventController.getEventById.bind(eventController));
router.post('/', authenticate, eventController.createEvent.bind(eventController));
router.patch('/:id', authenticate, eventController.updateEvent.bind(eventController));
router.post('/:id/join', authenticate, eventController.joinEvent.bind(eventController));
router.delete('/:id/leave', authenticate, eventController.leaveEvent.bind(eventController));

export default router;
