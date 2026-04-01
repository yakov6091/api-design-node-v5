import env from '../env.ts';
import { app } from './server.ts';

app.listen(env.PORT, () => {
    console.log(`Server is running on ${env.PORT}`);
})