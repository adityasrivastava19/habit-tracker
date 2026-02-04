const express = require('express');
const Habit = require('../models/Habit');
const jwt = require('jsonwebtoken');

const router = express.Router();

const verifyToken = (req, res, next) => {
    const authHeader = req.header('Authorization');
    if (!authHeader) return res.status(401).json({ message: 'Access Denied' });

    // Extract token from "Bearer <token>" format or use raw token
    const token = authHeader.startsWith('Bearer ')
        ? authHeader.slice(7)
        : authHeader;

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        req.user = verified;
        next();
    } catch (err) {
        res.status(400).json({ message: 'Invalid Token' });
    }
};

router.get('/', verifyToken, async (req, res) => {
    try {
        const habits = await Habit.find({ userId: req.user.id });
        res.json(habits);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/', verifyToken, async (req, res) => {
    const { name, scheduledTime } = req.body;
    const habit = new Habit({
        userId: req.user.id,
        name,
        scheduledTime
    });
    try {
        const savedHabit = await habit.save();
        res.json(savedHabit);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.put('/:id', verifyToken, async (req, res) => {
    try {
        const { date, completed } = req.body;
        const habit = await Habit.findById(req.params.id);
        if (!habit) return res.status(404).json({ message: 'Habit not found' });

        const existingLogIndex = habit.logs.findIndex(log => log.date === date);

        if (existingLogIndex > -1) {
            if (habit.logs[existingLogIndex].completed && !completed) {
                return res.status(400).json({ message: 'Cannot unmark a completed habit' });
            }
            habit.logs[existingLogIndex].completed = completed;
            if (completed) {
                const now = new Date();
                habit.logs[existingLogIndex].timestamp = now;

                if (habit.scheduledTime) {
                    const [hours, minutes] = habit.scheduledTime.split(':');
                    const scheduled = new Date(now);
                    scheduled.setHours(parseInt(hours), parseInt(minutes), 0, 0);
                    habit.logs[existingLogIndex].onTime = now <= scheduled;
                }
            }
        } else {
            const now = new Date();
            let onTime = undefined;

            if (completed && habit.scheduledTime) {
                const [hours, minutes] = habit.scheduledTime.split(':');
                const scheduled = new Date(now);
                scheduled.setHours(parseInt(hours), parseInt(minutes), 0, 0);
                onTime = now <= scheduled;
            }

            habit.logs.push({
                date,
                completed,
                timestamp: completed ? now : null,
                onTime
            });
        }

        await habit.save();
        res.json(habit);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.delete('/:id', verifyToken, async (req, res) => {
    try {
        await Habit.findByIdAndDelete(req.params.id);
        res.json({ message: 'Habit deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
