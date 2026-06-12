import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:3020/api';

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const upstreamResponse = await fetch(`${BACKEND_URL}/compiler/parse`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
    });

    const contentType = upstreamResponse.headers.get('content-type') ?? 'application/json';
    const body = await upstreamResponse.text();

    return new NextResponse(body, {
      status: upstreamResponse.status,
      headers: {
        'Content-Type': contentType,
      },
    });
  } catch (error) {
    console.error('Error proxying parse request:', error);
    return NextResponse.json(
      { message: 'Error al conectar con el backend' },
      { status: 502 }
    );
  }
}