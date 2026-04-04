import express from 'express';
import cors from 'cors';
import router from './src/router.js';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// fichiers statiques (covers)
app.use('/images', express.static(path.resolve('public/images')));

// API
app.use('/api', router);

// servir React (Vite build)
const __dirname = new URL('.', import.meta.url).pathname;

app.use(express.static(path.join(__dirname, '../client/dist')));

// fallback pour React Router
app.get('/:any(*)', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

export default app;
