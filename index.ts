import express from 'express';
import cors from 'cors';
import { config } from './config';
import router from './routes';

const app = express();

app.use(cors());
app.use(express.json());

// Mount routes
app.use('/api', router); 

app.listen(config.port, () => {
    console.log(`🚀 Vector Store Microservice running on port ${config.port}`);
});