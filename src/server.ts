import express from 'express';
import authRoutes from './routes/authRoutes.ts';
import userRoutes from './routes/userRoutes.ts';
import userHabits from './routes/habitRoutes.ts';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import { isTest } from '../env.ts';
import { APIError, errorHandler } from './middleware/errorHandler.ts';

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev', {
    skip: () => isTest(),
}));

// Error handler example
// app.use((_, __, next) => {
//     next(new APIError('validation error', 'ValidationError', 400));
// });

app.get('/health', (req, res) => {
    res.json({ message: 'hello' }).status(200);
})

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/habits', userHabits);

// Error handler
app.use(errorHandler);

// app.listen(4000, () => {
//     console.log('Server is running on port 4000');
// })

export { app };
// export default app;