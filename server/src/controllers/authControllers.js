// server\src\controllers\authControllers.js
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';

export const login = async (req, res) => {
  const { username, password } = req.body;
  const user = await userModel.findByUsername(username);
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.json({ token });
};

// export const login = async (req, res) => {
//   console.log('req.body:', req.body);
//   const { username, password } = req.body || {};
//   if (!username || !password)
//     return res.status(400).json({ message: 'Missing username or password' });

//   const user = await userModel.findByUsername(username);
//   if (!user) return res.status(401).json({ message: 'Invalid credentials' });

//   const isMatch = await bcrypt.compare(password, user.password);
//   if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

//   const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
//   res.json({ token });
// };
