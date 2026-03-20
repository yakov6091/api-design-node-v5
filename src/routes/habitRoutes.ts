import { Router } from "express";
import { validateBody, validateParams } from "../middleware/validation.ts";
import { z } from 'zod';

const createHabitSchema = z.object({
    name: z.string(),
});

const completeParamsSchema = z.object({
    id: z.string(),
})

const router = Router();

router.get('/', (req, res) => {
    res.json({ message: 'habits' });
});

router.get('/:id', (req, res) => {
    res.json({ message: 'get one habbit' });
});

router.post('/', validateBody(createHabitSchema), (req, res) => {
    res.json({ message: 'created habit' }).status(201);
});

router.post('/:id/complete', validateParams(completeParamsSchema),
    validateBody(createHabitSchema), (req, res) => {
        res.status(201).json({ message: 'completed habit' });;
    });

router.delete('/:id', (req, res) => {
    res.json({ message: 'deleted habit' });
});

export default router;