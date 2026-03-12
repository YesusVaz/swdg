import { Router } from 'express';
import { authRoutes } from '../modules/auth';
import { userRoutes } from '../modules/users';
import { teamRoutes } from '../modules/teams';
import { kanbanRoutes } from '../modules/kanban';
import { taskRoutes } from '../modules/tasks';

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/teams', teamRoutes);
router.use('/kanban', kanbanRoutes);
router.use('/tasks', taskRoutes);

export default router;
