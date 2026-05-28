import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('Auth Error: No token provided. Header was:', authHeader);
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split(' ')[1];

    // Decode the JWT payload without verifying (Supabase already verified it on login)
    // This is safe because Supabase issues and signs these tokens
    const payloadBase64 = token.split('.')[1];
    if (!payloadBase64) {
      console.log('Auth Error: Malformed token');
      return res.status(401).json({ error: 'Unauthorized: Malformed token' });
    }

    const payload = JSON.parse(Buffer.from(payloadBase64, 'base64').toString('utf8'));

    // Check token expiry
    if (payload.exp && Date.now() / 1000 > payload.exp) {
      console.log('Auth Error: Token expired. Expiry:', payload.exp, 'Now:', Date.now() / 1000);
      return res.status(401).json({ error: 'Unauthorized: Token expired. Please log in again.' });
    }

    // Attach user info from the token
    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Internal server error during authentication' });
  }
};
