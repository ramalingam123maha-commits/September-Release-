const express = require('express');
const router = express.Router();
const Goal = require('../models/Goal');

// Create goal
router.post('/', async (req, res) => {
  try {
    const { userId, title, description, goalType, targetValue, unit, deadline } = req.body;

    if (!userId || !title || !goalType || targetValue === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const goal = new Goal({
      userId,
      title,
      description,
      goalType,
      targetValue,
      unit,
      deadline
    });

    await goal.save();
    res.status(201).json(goal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user goals
router.get('/user/:userId', async (req, res) => {
  try {
    const goals = await Goal.find({ userId: req.params.userId });
    res.json(goals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update goal
router.put('/:goalId', async (req, res) => {
  try {
    const goal = await Goal.findByIdAndUpdate(req.params.goalId, req.body, { new: true });
    res.json(goal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete goal
router.delete('/:goalId', async (req, res) => {
  try {
    await Goal.findByIdAndDelete(req.params.goalId);
    res.json({ message: 'Goal deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
