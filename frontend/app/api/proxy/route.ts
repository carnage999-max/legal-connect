import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = 'http://api.legalconnectapp.com';

export async function POST(request: NextRequest) {
  const url = new URL(request.url);
  const path = url.pathname.replace('/api/proxy', '');
  const queryString = url.search;
  const backendUrl = `${BACKEND_URL}${path}${queryString}`;

  try {
    const body = await request.text();
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('authorization') || '',
        'Host': 'api.legalconnectapp.com',
      },
      body: body || undefined,
    });

    const responseBody = await response.text();
    return new NextResponse(responseBody, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('content-type') || 'application/json',
      },
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Proxy request failed' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const path = url.pathname.replace('/api/proxy', '');
  const queryString = url.search;
  const backendUrl = `${BACKEND_URL}${path}${queryString}`;

  try {
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Authorization': request.headers.get('authorization') || '',
        'Host': 'api.legalconnectapp.com',
      },
    });

    const responseBody = await response.text();
    return new NextResponse(responseBody, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('content-type') || 'application/json',
      },
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Proxy request failed' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const url = new URL(request.url);
  const path = url.pathname.replace('/api/proxy', '');
  const queryString = url.search;
  const backendUrl = `${BACKEND_URL}${path}${queryString}`;

  try {
    const body = await request.text();
    const response = await fetch(backendUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('authorization') || '',
        'Host': 'api.legalconnectapp.com',
      },
      body: body || undefined,
    });

    const responseBody = await response.text();
    return new NextResponse(responseBody, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('content-type') || 'application/json',
      },
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Proxy request failed' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const url = new URL(request.url);
  const path = url.pathname.replace('/api/proxy', '');
  const queryString = url.search;
  const backendUrl = `${BACKEND_URL}${path}${queryString}`;

  try {
    const body = await request.text();
    const response = await fetch(backendUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('authorization') || '',
        'Host': 'api.legalconnectapp.com',
      },
      body: body || undefined,
    });

    const responseBody = await response.text();
    return new NextResponse(responseBody, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('content-type') || 'application/json',
      },
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Proxy request failed' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const url = new URL(request.url);
  const path = url.pathname.replace('/api/proxy', '');
  const queryString = url.search;
  const backendUrl = `${BACKEND_URL}${path}${queryString}`;

  try {
    const body = await request.text();
    const response = await fetch(backendUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('authorization') || '',
        'Host': 'api.legalconnectapp.com',
      },
      body: body || undefined,
    });

    const responseBody = await response.text();
    return new NextResponse(responseBody, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('content-type') || 'application/json',
      },
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Proxy request failed' },
      { status: 500 }
    );
  }
}
