import { NextResponse } from 'next/server';

/**
 * Runtime config endpoint — exposes the backend URL to the client.
 * This avoids baking NEXT_PUBLIC_* at build time, so Socket.IO
 * works with dynamic URLs (e.g. Cloudflare tunnels).
 */
export const GET = () => {
  return NextResponse.json({
    socketUrl: process.env.SOCKET_URL || process.env.BACKEND_URL,
  });
};
