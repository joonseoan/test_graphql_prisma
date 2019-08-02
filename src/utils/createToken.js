import jwt from 'jsonwebtoken';

export default userId => jwt.sign({ userId }, process.env.PRISMA_JWT_SECRET, { expiresIn: '7 days' });
