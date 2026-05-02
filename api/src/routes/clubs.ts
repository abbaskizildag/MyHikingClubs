import { Router } from 'express';
import { ClubController } from '../controllers/clubController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();
const clubController = new ClubController();

router.patch('/update/:id', authenticate, clubController.updateClub.bind(clubController));
router.put('/update/:id', authenticate, clubController.updateClub.bind(clubController));
router.get('/', clubController.getAllClubs.bind(clubController));
router.get('/:id', clubController.getClubById.bind(clubController));
router.post('/', authenticate, clubController.createClub.bind(clubController));
router.post('/:id/join', authenticate, clubController.joinClub.bind(clubController));
router.get('/:id/members', clubController.getMembers.bind(clubController));
router.patch('/:id/members/role', authenticate, clubController.updateMemberRole.bind(clubController));

export default router;
