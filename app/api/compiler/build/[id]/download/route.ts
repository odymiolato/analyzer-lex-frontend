import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:3020/api';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const upstreamResponse = await fetch(`${BACKEND_URL}/compiler/build/${id}/download`, {
      cache: 'no-store',
    });

    if (!upstreamResponse.ok) {
      const body = await upstreamResponse.text();
      return new NextResponse(body, {
        status: upstreamResponse.status,
        headers: {
          'Content-Type': upstreamResponse.headers.get('content-type') ?? 'application/json',
        },
      });
    }

    return new NextResponse(upstreamResponse.body, {
      status: 200,
      headers: {
        'Content-Type': upstreamResponse.headers.get('content-type') ?? 'application/octet-stream',
        'Content-Disposition':
          upstreamResponse.headers.get('content-disposition') ?? 'attachment; filename="programa.exe"',
      },
    });
  } catch (error) {
    console.error('Error proxying download request:', error);
    return NextResponse.json(
      { message: 'Error al conectar con el backend' },
      { status: 502 }
    );
  }
}
