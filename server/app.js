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

// Fallback React (Express 4)
app.use(express.static(path.resolve('../client/dist')));
app.get('*', (req, res) => {
  res.sendFile(path.resolve('../client/dist/index.html'));
});

export default app;
