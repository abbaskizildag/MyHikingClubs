import express from 'express';
import cors from 'cors';
import eventRoutes from './routes/events';
import authRoutes from './routes/auth';
import clubRoutes from './routes/clubs';
import locationRoutes from './routes/locations';
import { authenticate } from './middleware/authMiddleware';
import { ClubController } from './controllers/clubController';

const app = express();
const clubController = new ClubController();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/events', eventRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/locations', locationRoutes);

// Balyoz Çözüm: Kulüp güncelleme rotasını doğrudan buraya çiviliyorum
app.patch('/api/clubs/update/:id', authenticate, clubController.updateClub.bind(clubController));
app.use('/api/clubs', clubRoutes);

// Catch-all for 404s with logging
app.use((req, res) => {
  console.log(`404 - Not Found: ${req.method} ${req.url}`);
  res.status(404).json({ error: `Route ${req.method} ${req.url} not found` });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'API is running' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
