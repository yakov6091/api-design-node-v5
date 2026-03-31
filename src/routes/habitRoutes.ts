import { Router } from "express";
import { validateBody, validateParams } from "../middleware/validation.ts";
import { z } from 'zod';
import { authenticateToken } from "../middleware/auth.ts";
import { createHabit, getUserHabits, updateHabit } from "../controllers/habitController.ts";

// const createHabitSchema = z.object({
//     name: z.string(),
// });

const createHabitSchema = z.object({
    name: z.string(),
    description: z.string(),
    frequency: z.string(),
    targetCount: z.number(),
    tagIds: z.array(z.string()).optional(),
});

const completeParamsSchema = z.object({
    id: z.string(),
});

const router = Router();

router.use(authenticateToken);

// router.get('/', (req, res) => {
//     res.json({ message: 'habits' });
// });

router.get('/', getUserHabits);

router.get('/:id', (req, res) => {
    res.json({ message: 'get one habbit' });
});

router.patch('/:id', updateHabit);

router.post('/', validateBody(createHabitSchema), createHabit);

router.post('/:id/complete', validateParams(completeParamsSchema),
    validateBody(createHabitSchema), (req, res) => {
        res.status(201).json({ message: 'completed habit' });;
    });

router.delete('/:id', (req, res) => {
    res.json({ message: 'deleted habit' });
});

export default router;