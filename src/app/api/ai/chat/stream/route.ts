import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL!;

/**
 * Next.js API route that proxies the SSE stream from the backend AI chat endpoint.
 * Forwards the HttpOnly accessToken cookie as a Bearer token so the client
 * can consume the stream directly without exposing auth credentials.
 */
export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;

  if (!token) {
    return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
  }

  const body = await req.json();

  const backendRes = await fetch(`${BACKEND_URL}/api/v1/ai/chat/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (!backendRes.ok) {
    const errorBody = await backendRes.json().catch(() => ({}));
    return NextResponse.json(
      { success: false, error: errorBody?.error?.message || 'AI chat failed' },
      { status: backendRes.status }
    );
  }

  // Pipe the SSE stream from backend to client
  const stream = backendRes.body;
  if (!stream) {
    return NextResponse.json(
      { success: false, error: 'No stream body from backend' },
      { status: 502 }
    );
  }

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
