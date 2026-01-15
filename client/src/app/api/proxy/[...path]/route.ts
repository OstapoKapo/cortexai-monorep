import { NextRequest, NextResponse } from "next/server";


const NEST_API_URL = process.env.NEST_INTERNAL_URL || 'http://localhost:3001';

async function proxyHandler(req: NextRequest, { params } : {params: {path: string[]}}) {
    const path = params.path.join('/');
    const searchParams = req.nextUrl.searchParams.toString();
    const targetUrl =  `${NEST_API_URL}/${path}${searchParams ? `?${searchParams}` : ''}`;

    const requestHeaders: Headers = new Headers(req.headers);
    requestHeaders.delete('host');
    requestHeaders.delete('connection');

    const cookieStore = req.cookies;
    const accessToken = cookieStore.get('accessToken');
    if (accessToken) {
        requestHeaders.set('Authorization', `Bearer ${accessToken.value}`);
    }

    const body = (req.method !== 'GET' && req.method !== 'HEAD') ? await req.blob() : null;

    try{
        console.log(`[Proxy] Forwarding ${req.method} to: ${targetUrl}`);
        const backendResponse = await fetch(targetUrl, {
            method: req.method,
            headers: requestHeaders,
            body,
            cache: 'no-store',
        } as RequestInit);

        return new NextResponse(backendResponse.body, {
            status: backendResponse.status,
            statusText: backendResponse.statusText,
            headers: backendResponse.headers,
        });
    }catch(error){
        console.error('Proxy error:', error);
        return NextResponse.json({ error: 'Proxy failed to reach the target server' }, { status: 502 });
    }
}

export const GET = proxyHandler;
export const POST = proxyHandler;
export const PUT = proxyHandler;
export const PATCH = proxyHandler;
export const DELETE = proxyHandler;