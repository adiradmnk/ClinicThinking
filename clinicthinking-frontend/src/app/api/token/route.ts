import { NextResponse } from 'next/server';
import { AccessToken } from 'livekit-server-sdk';

export const revalidate = 0;
// Jangan cache route ini — selalu server-rendered
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  // Baca env di dalam function, bukan module scope
  // supaya selalu ambil dari runtime environment (Docker env vars)
  // bukan dari build-time snapshot
  const API_KEY    = process.env.LIVEKIT_API_KEY;
  const API_SECRET = process.env.LIVEKIT_API_SECRET;
  const SERVER_URL = process.env.NEXT_PUBLIC_LIVEKIT_URL ?? 'ws://localhost:7880';

  try {
    const body = await req.json();
    const { sessionId, username } = body;

    if (!sessionId || !username) {
      return new NextResponse('Session ID and Username are required', { status: 400 });
    }

    if (!API_KEY || !API_SECRET) {
      console.error('[token] LiveKit credentials missing. API_KEY:', API_KEY ? 'set' : 'MISSING');
      return new NextResponse('LiveKit credentials not configured', { status: 500 });
    }

    console.log('[token] Generating token with API_KEY:', API_KEY, '| serverUrl:', SERVER_URL);

    const at = new AccessToken(API_KEY, API_SECRET, {
      identity: username,
      ttl: '1h',
    });

    at.addGrant({
      roomJoin: true,
      room: sessionId,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    });

    return NextResponse.json({
      token: await at.toJwt(),
      serverUrl: SERVER_URL,
    });
  } catch (error) {
    console.error('[token] Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}