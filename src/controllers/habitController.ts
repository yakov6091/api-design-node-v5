import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.ts";
import { db } from '../db/connection.ts';
import { habits, entries, habitTags, tags } from "../db/schema.ts";
import { eq, and, desc, inArray } from 'drizzle-orm';
import { error } from "console";

// Create habit
export const createHabit = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    try {
        const { name, description, frequency, targetCount, tagIds } = req.body;

        const result = await db.transaction(async (tx) => {
            const [newHabit] = await tx.insert(habits).values({
                userId: req.user.id,
                name,
                description,
                frequency,
                targetCount,
            }).returning();

            // If tags are provided, create the associations
            if (tagIds && tagIds.length > 0) {
                const habitTagValues = tagIds.map((tagId) => ({
                    habitId: newHabit.id,
                    tagId,
                }));

                await tx.insert(habitTags).values(habitTagValues);
            };

            return newHabit;
        });

        res.status(201).json({
            message: 'Habit created',
            habit: result
        });

    } catch (error) {
        console.error('Create habit error:', error);
        res.status(500).json({ error: 'Failed to create habit' });
    }
};

// Get user habits
export const getUserHabits = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    try {
        const userHabitsWithTags = await db.query.habits.findMany({
            where: eq(habits.userId, req.user.id),
            with: {
                habitTags: {
                    with: {
                        tag: true,
                    }
                }
            },
            orderBy: [desc(habits.createdAt)],
        });

        const habitsWithTags = userHabitsWithTags.map(habit => ({
            ...habit,
            tags: habit.habitTags.map((habit) => habit.tag),
            habitTags: undefined
        }));

        res.json({ habits: habitsWithTags });

    } catch (error) {
        console.error('Get habits error', error);
        res.status(500).json({ error: 'Failed to fetch habits' });
    }
};

// Update habit
export const updateHabit = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    try {
        const { id } = req.params;
        const { tagIds, ...updates } = req.body;

        const result = await db.transaction(async (tx) => {
            const [updateHabit] = await tx
                .update(habits)
                .set({ ...updates, updateAt: new Date() })
                .where(and(eq(habits.id, id), eq(habits.userId, req.user.id)))
                .returning()

            if (!updateHabit) {
                return res.status(401).end();
            };

            if (tagIds !== undefined) {
                await tx.delete(habitTags).where(eq(habitTags.habitId, id));

                if (tagIds.length > 0) {
                    const habitTagValues = tagIds.map((tagId) => ({
                        habitId: id,
                        tagId
                    }));

                    await tx.insert(habitTags).values(habitTagValues);
                }
            }
            return updateHabit;
        });

        res.json({
            message: 'Habit updated',
            habit: result
        });


    } catch (error) {
        console.error('Update habit error', error);
        res.status(500).json({ error: 'Failed to update habit' });
    }
};