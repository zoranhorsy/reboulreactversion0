import { NextApiRequest, NextApiResponse } from 'next'

export function middleware(req: NextApiRequest, res: NextApiResponse, next: () => void) {
    console.log('API Middleware - Request:', req.method, req.url);
    console.log('API Middleware - Request body:', JSON.stringify(req.body, null, 2));
    next();
}

