import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:3020/api';

// El backend transmite NDJSON fase por fase — evita cualquier cacheo/buffering.
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const payload = await request.text();
    const upstreamResponse = await fetch(`${BACKEND_URL}/compiler/build`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: payload,
      cache: 'no-store',
    });

    return new NextResponse(upstreamResponse.body, {
      status: upstreamResponse.status,
      headers: {
        'Content-Type':
          upstreamResponse.headers.get('content-type') ?? 'application/x-ndjson; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('Error proxying build request:', error);
    return NextResponse.json(
      { message: 'Error al conectar con el backend' },
      { status: 502 }
    );
  }
}
