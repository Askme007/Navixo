import express from 'express';
import { PrismaClient } from '@prisma/client';
import authenticateToken from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// 1. GET /api/tasks/today -> Fetch or Generate Morning Draft
router.get('/today', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date().toISOString().split('T')[0];

    // Check if check-in exists for today (Using verified snake_case composite index)
    const checkinRecord = await prisma.task_checkins?.findUnique({
      where: {
        user_id_date: { user_id: userId, date: new Date(today) }
      },
      select: { id: true }
    });
    
    const isCheckedIn = !!checkinRecord;

    // Check if daily tasks already exist for today
    const existingTasks = await prisma.daily_tasks?.findUnique({
      where: {
        user_id_date: { user_id: userId, date: new Date(today) }
      },
      select: { tasks: true }
    });

    if (existingTasks) {
      return res.json({
        success: true,
        data: existingTasks.tasks,
        isCheckedIn,
      });
    }

    // Fetch user state to determine load
    let state = await prisma.user_state?.findUnique({
      where: { user_id: userId },
      select: { current_phase: true, mode: true }
    });

    if (!state) {
      state = { current_phase: 'Foundation', mode: 'progression' };
    }

    // Generate daily load
    let dailyLoad = state.mode === 'recovery'
      ? [
          { id: `dsa-${Date.now()}-rec1`, title: 'Review 1 Easy Array problem', category: 'DSA', completed: false },
          { id: `dev-${Date.now()}-rec2`, title: 'Read architecture documentation', category: 'Development', completed: false },
        ]
      : [
          { id: `dsa-${Date.now()}-1`, title: 'Solve 2 Medium DP constraints', category: 'DSA', completed: false },
          { id: `dev-${Date.now()}-2`, title: 'Implement JWT Auth Middleware', category: 'Development', completed: false },
          { id: `cs-${Date.now()}-3`, title: 'Review OS Process Scheduling', category: 'Core CS', completed: false },
        ];

    // Insert new daily tasks
    await prisma.daily_tasks?.create({
      data: {
        user_id: userId,
        date: new Date(today),
        tasks: dailyLoad
      }
    });

    res.json({ success: true, data: dailyLoad, isCheckedIn });
  } catch (err) {
    console.error('GET /today Error:', err);
    res.status(500).json({ error: 'Failed to generate daily load.' });
  }
});

// 2. PUT /api/tasks/today -> Auto-Save Draft Edits
router.put('/today', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date().toISOString().split('T')[0];
    const { tasks } = req.body;

    await prisma.daily_tasks?.update({
      where: {
        user_id_date: { user_id: userId, date: new Date(today) }
      },
      data: { tasks }
    });

    res.json({ success: true });
  } catch (err) {
    console.error('PUT /today Error:', err);
    res.status(500).json({ error: 'Failed to sync draft.' });
  }
});

// 3. POST /api/tasks/checkin -> Final Lock
router.post('/checkin', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { completionRate, completedTasks, notes } = req.body;
    const today = new Date().toISOString().split('T')[0];

    // ABSOLUTE TRUTH CHECK (Uses correct structure from verification log)
    const existingCheckin = await prisma.task_checkins?.findUnique({
      where: {
        user_id_date: {
          user_id: userId,
          date: new Date(today)
        }
      }
    });

    if (existingCheckin) {
      return res.status(400).json({ error: 'Execution already locked for today.' });
    }

    // Get or Create User State
    let state = await prisma.user_state?.findUnique({
      where: { user_id: userId }
    });

    if (!state) {
      state = await prisma.user_state?.create({
        data: {
          user_id: userId,
          streak: 0,
          mode: 'progression',
          current_phase: 'Foundation'
        }
      });
    }

    let newStreak = state.streak || 0;
    let newMode = state.mode || 'progression';
    let consecutiveSkips = state.consecutive_skips || 0;

    // Calculate progression math safely
    if (state.last_checkin_date) {
      const lastCheckinDateStr = new Date(state.last_checkin_date).toISOString().split('T')[0];
      
      if (lastCheckinDateStr !== today) {
        const diffDays = Math.ceil(
          Math.abs(new Date(today) - new Date(state.last_checkin_date)) / (1000 * 60 * 60 * 24)
        );
        if (diffDays > 1) {
          consecutiveSkips += (diffDays - 1);
          newStreak = 0;
          if (consecutiveSkips >= 2) newMode = 'recovery';
        } else {
          consecutiveSkips = 0;
          if (completionRate >= 50) newStreak += 1;
          if (newStreak >= 3) newMode = 'progression';
        }
      }
    } else {
      if (completionRate >= 50) newStreak += 1;
    }

    // Execute database updates inside a transactional unit
    await prisma.$transaction([
      prisma.user_state.update({
        where: { user_id: userId },
        data: {
          streak: newStreak,
          last_checkin_date: new Date(today),
          consecutive_skips: consecutiveSkips,
          mode: newMode,
        }
      }),
      prisma.task_checkins.create({
        data: {
          user_id: userId,
          date: new Date(today),
          tasks_completed: completedTasks || [],
          completion_rate: completionRate,
          notes: notes || ''
        }
      })
    ]);

    res.json({
      success: true,
      message: 'Telemetry logged.',
      data: { streak: newStreak, mode: newMode, completionRate }
    });
  } catch (err) {
    console.error('POST /checkin Error:', err);
    res.status(500).json({ error: 'Failed to process execution data.' });
  }
});

export default router;