import db from '@/db';
import { Codes } from '@/db/schema';

export async function GET(req: Request) {
  // const codes = await db.select().from(Codes).all();
  return Response.json('hi');
}
