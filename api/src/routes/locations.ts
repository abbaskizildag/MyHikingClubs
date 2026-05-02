import { Router } from 'express';
import { LocationController } from '../controllers/locationController';

const router = Router();
const locationController = new LocationController();

router.get('/countries', locationController.getCountries.bind(locationController));
router.get('/cities', locationController.getCities.bind(locationController));

export default router;
