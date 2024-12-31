import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    res.status(308).setHeader('Location', '/api/admin/orders').end();
}

