import express from 'express';
import { prisma } from '../config/prisma.js';
import authenticateToken from '../middleware/auth.js';

const router = express.Router();

/**
 * Generates an intelligent, personalized daily execution protocol
 * derived from the student's active roadmap, current step, LeetCode tier, and mode.
 */
async function generateIntelligentTasks(userId) {
  // 1. Fetch user state
  let state = null;
  try {
    state = await prisma.user_state?.findUnique({
      where: { user_id: userId },
    });
  } catch {
    // Non-fatal fallback
  }

  const mode = state?.mode || 'progression';
  const activeRoadmapId = state?.active_roadmap_id;

  // 2. Fetch active roadmap with steps (fallback to latest roadmap)
  let roadmap = null;
  if (activeRoadmapId) {
    try {
      roadmap = await prisma.userRoadmap.findFirst({
        where: { id: activeRoadmapId, userId },
        include: {
          steps: {
            orderBy: { stepOrder: 'asc' },
          },
        },
      });
    } catch {}
  }

  if (!roadmap) {
    try {
      roadmap = await prisma.userRoadmap.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        include: {
          steps: {
            orderBy: { stepOrder: 'asc' },
          },
        },
      });
    } catch {}
  }

  // 3. Fetch LeetCode stats for DSA level calibration
  let leetcode = null;
  try {
    leetcode = await prisma.leetcodeProfile.findUnique({
      where: { userId },
    });
  } catch {}

  const solvedCount = leetcode?.solved || 0;

  // 4. Find the current active step in the roadmap
  let activeStep = null;
  if (roadmap?.steps?.length) {
    activeStep =
      roadmap.steps.find((s) => s.status === 'in-progress') ||
      roadmap.steps.find((s) => s.status === 'not-started') ||
      roadmap.steps[roadmap.steps.length - 1];
  }

  // Task 1: Target Career & Active Step Execution (Core Domain)
  let taskDomain;
  if (activeStep) {
    const cleanTitle = activeStep.title?.replace(/^Phase\s*\d+:\s*/i, '') || 'Current Focus';
    taskDomain = {
      id: `step-${Date.now()}-1`,
      title: `${activeStep.title || 'Phase'}: Deep-dive & implement ${cleanTitle}`,
      category: 'Roadmap Focus',
      completed: false,
    };
  } else {
    taskDomain = {
      id: `setup-${Date.now()}-1`,
      title: 'Generate and activate your target Career Roadmap on Navixo',
      category: 'Roadmap Focus',
      completed: false,
    };
  }

  // Task 2: Dynamic DSA Protocol (Calibrated to LeetCode Level)
  let taskDsa;
  if (mode === 'recovery') {
    taskDsa = {
      id: `dsa-${Date.now()}-rec`,
      title: 'Solve 1 Easy LeetCode problem (Array/String) to restore momentum',
      category: 'DSA Warm-up',
      completed: false,
    };
  } else if (solvedCount < 50) {
    taskDsa = {
      id: `dsa-${Date.now()}-beg`,
      title: 'Solve 2 Easy LeetCode problems on Two Pointers or Hash Tables',
      category: 'DSA Foundation',
      completed: false,
    };
  } else if (solvedCount < 200) {
    taskDsa = {
      id: `dsa-${Date.now()}-mid`,
      title: 'Solve 2 Medium LeetCode problems on Binary Trees or Sliding Window',
      category: 'DSA Intermediate',
      completed: false,
    };
  } else {
    taskDsa = {
      id: `dsa-${Date.now()}-adv`,
      title: 'Solve 1 Medium + 1 Hard LeetCode problem on DP or Graphs',
      category: 'DSA Advanced',
      completed: false,
    };
  }

  // In recovery mode, provide a focused 2-task load to avoid overwhelm
  if (mode === 'recovery') {
    return [taskDsa, taskDomain];
  }

  // Task 3: Rotating Core CS & Placement Interview Fundamentals
  const dayIndex = new Date().getDay();
  const coreCsRotations = [
    { title: 'Weekly Review: Re-attempt 1 failed DSA problem & revise notes', category: 'Revision' },
    { title: 'Operating Systems: Review Process Scheduling, Virtual Memory & Deadlocks', category: 'Core CS' },
    { title: 'Database Systems: Review B-Tree Indexing, SQL Joins & ACID Transactions', category: 'Core CS' },
    { title: 'System Design: Review Horizontal Scaling, Caching Layers & Load Balancers', category: 'System Design' },
    { title: 'Computer Networks: Trace TCP 3-Way Handshake, DNS Flow & HTTP/3', category: 'Core CS' },
    { title: 'Behavioral / STAR: Prepare 1 technical project challenge story for interviews', category: 'Interview Prep' },
    { title: 'Contest Simulation: Participate in or upsolve 1 LeetCode/Codeforces contest', category: 'Contest' },
  ];

  const coreTask = coreCsRotations[dayIndex];
  const taskCoreCs = {
    id: `core-${Date.now()}-3`,
    title: coreTask.title,
    category: coreTask.category,
    completed: false,
  };

  return [taskDsa, taskDomain, taskCoreCs];
}

// 1. GET /api/tasks/today -> Fetch or Generate Morning Draft
router.get('/today', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date().toISOString().split('T')[0];

    // Check if check-in exists for today
    const checkinRecord = await prisma.task_checkins?.findUnique({
      where: {
        user_id_date: { user_id: userId, date: new Date(today) },
      },
      select: { id: true },
    });

    const isCheckedIn = !!checkinRecord;

    // Check if daily tasks already exist for today
    const existingTasks = await prisma.daily_tasks?.findUnique({
      where: {
        user_id_date: { user_id: userId, date: new Date(today) },
      },
      select: { tasks: true },
    });

    if (existingTasks) {
      return res.json({
        success: true,
        data: existingTasks.tasks,
        isCheckedIn,
      });
    }

    // Generate dynamic intelligent tasks based on active roadmap & level
    const dailyLoad = await generateIntelligentTasks(userId);

    // Insert new daily tasks
    await prisma.daily_tasks?.create({
      data: {
        user_id: userId,
        date: new Date(today),
        tasks: dailyLoad,
      },
    });

    return res.json({ success: true, data: dailyLoad, isCheckedIn });
  } catch (err) {
    console.error('GET /today Error:', err);
    return res.status(500).json({ error: 'Failed to generate daily load.' });
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
        user_id_date: { user_id: userId, date: new Date(today) },
      },
      data: { tasks },
    });

    return res.json({ success: true });
  } catch (err) {
    console.error('PUT /today Error:', err);
    return res.status(500).json({ error: 'Failed to sync draft.' });
  }
});

// 3. POST /api/tasks/regenerate -> Re-align today's draft with active roadmap
router.post('/regenerate', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date().toISOString().split('T')[0];

    // Block regeneration if already checked in
    const checkinRecord = await prisma.task_checkins?.findUnique({
      where: {
        user_id_date: { user_id: userId, date: new Date(today) },
      },
      select: { id: true },
    });

    if (checkinRecord) {
      return res.status(400).json({
        error: 'Cannot regenerate tasks after evening check-in is submitted.',
      });
    }

    const newTasks = await generateIntelligentTasks(userId);

    await prisma.daily_tasks?.upsert({
      where: {
        user_id_date: { user_id: userId, date: new Date(today) },
      },
      update: { tasks: newTasks },
      create: {
        user_id: userId,
        date: new Date(today),
        tasks: newTasks,
      },
    });

    return res.json({
      success: true,
      data: newTasks,
      message: 'Tasks aligned with active roadmap.',
    });
  } catch (err) {
    console.error('POST /regenerate Error:', err);
    return res.status(500).json({ error: 'Failed to regenerate daily load.' });
  }
});

// 4. POST /api/tasks/checkin -> Final Lock & Streak Math
router.post('/checkin', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { completionRate, completedTasks, notes } = req.body;
    const today = new Date().toISOString().split('T')[0];

    // Check if checkin already submitted today
    const existingCheckin = await prisma.task_checkins?.findUnique({
      where: {
        user_id_date: {
          user_id: userId,
          date: new Date(today),
        },
      },
    });

    if (existingCheckin) {
      return res.status(400).json({ error: 'Execution already locked for today.' });
    }

    // Get or Create User State
    let state = await prisma.user_state?.findUnique({
      where: { user_id: userId },
    });

    if (!state) {
      state = await prisma.user_state?.create({
        data: {
          user_id: userId,
          streak: 0,
          mode: 'progression',
          current_phase: 'Foundation',
        },
      });
    }

    let newStreak = state.streak || 0;
    let newMode = state.mode || 'progression';
    let consecutiveSkips = state.consecutive_skips || 0;

    // Calculate progression math
    if (state.last_checkin_date) {
      const lastCheckinDateStr = new Date(state.last_checkin_date)
        .toISOString()
        .split('T')[0];

      if (lastCheckinDateStr !== today) {
        const diffDays = Math.ceil(
          Math.abs(new Date(today) - new Date(state.last_checkin_date)) /
            (1000 * 60 * 60 * 24)
        );
        if (diffDays > 1) {
          consecutiveSkips += diffDays - 1;
          newStreak = completionRate >= 50 ? 1 : 0;
          if (consecutiveSkips >= 2 && newStreak === 0) newMode = 'recovery';
          else if (newStreak > 0) newMode = 'progression';
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
        },
      }),
      prisma.task_checkins.create({
        data: {
          user_id: userId,
          date: new Date(today),
          tasks_completed: completedTasks || [],
          completion_rate: completionRate,
          notes: notes || '',
        },
      }),
    ]);

    // Non-blocking sync to execution_history
    try {
      await prisma.execution_history?.upsert({
        where: {
          user_id_date: { user_id: userId, date: new Date(today) },
        },
        update: {
          phase: state.current_phase || 'Foundation',
          streak_at_time: newStreak,
          mode_at_time: newMode,
          completion_rate: completionRate,
        },
        create: {
          user_id: userId,
          date: new Date(today),
          phase: state.current_phase || 'Foundation',
          streak_at_time: newStreak,
          mode_at_time: newMode,
          completion_rate: completionRate,
        },
      });
    } catch {
      // Non-fatal
    }

    return res.json({
      success: true,
      message: 'Telemetry logged.',
      data: { streak: newStreak, mode: newMode, completionRate },
    });
  } catch (err) {
    console.error('POST /checkin Error:', err);
    return res.status(500).json({ error: 'Failed to process execution data.' });
  }
});

export { generateIntelligentTasks };
export default router;