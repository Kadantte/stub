import { NextApiRequest, NextApiResponse } from 'next';

import { withProjectAuth } from '@/lib/auth';
import { getRandomKey } from '@/lib/redis';

export default withProjectAuth(async (req: NextApiRequest, res: NextApiResponse, project) => {
  // GET /api/projects/[slug]/links/random – get a random link
  if (req.method === 'GET') {
    const key = await getRandomKey(project.domain);
    return res.status(200).json(key);
  } else {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
});
