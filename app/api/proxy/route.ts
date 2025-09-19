import { NextRequest, NextResponse } from 'next/server'

/**
 * Proxy API para evitar problemas de CORS
 * Redirige todas las requests a la API externa desde el servidor
 */

const EXTERNAL_API_BASE = 'https://inventoryapp.usbtopia.usbbog.edu.co'

export async function GET(request: NextRequest) {
  try {
    // Obtener los parámetros de la URL
    const { searchParams } = new URL(request.url)
    const endpoint = searchParams.get('endpoint') || '/inventario/'
    const skip = searchParams.get('skip') || '0'
    const limit = searchParams.get('limit') || '100'

    // Construir la URL de la API externa
    const externalUrl = new URL(endpoint, EXTERNAL_API_BASE)
    externalUrl.searchParams.set('skip', skip)
    externalUrl.searchParams.set('limit', limit)

    console.log('🔄 Proxy request to:', externalUrl.toString())

    // Hacer la request al servidor externo
    const response = await fetch(externalUrl.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'inventarioUSB-proxy/1.0',
      },
      cache: 'no-cache',
    })

    console.log('📡 External API response:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    })

    if (!response.ok) {
      console.error('❌ External API error:', response.status, response.statusText)
      return NextResponse.json(
        { error: `External API error: ${response.status} ${response.statusText}` },
        { status: response.status }
      )
    }

    // Obtener los datos
    const data = await response.json()
    console.log('✅ Data received:', Array.isArray(data) ? `${data.length} items` : typeof data)

    // Devolver los datos con headers CORS correctos
    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Cache-Control': 'no-cache',
      },
    })

  } catch (error) {
    console.error('❌ Proxy error:', error)
    return NextResponse.json(
      { 
        error: 'Proxy error', 
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const endpoint = searchParams.get('endpoint') || '/inventario/'
    const body = await request.json()

    const externalUrl = new URL(endpoint, EXTERNAL_API_BASE)
    console.log('🔄 Proxy POST to:', externalUrl.toString())

    const response = await fetch(externalUrl.toString(), {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'inventarioUSB-proxy/1.0',
      },
      body: JSON.stringify(body),
      cache: 'no-cache',
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json(
        { error: `External API error: ${response.status} ${response.statusText}`, details: errorText },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data, {
      status: 201,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })

  } catch (error) {
    console.error('❌ Proxy POST error:', error)
    return NextResponse.json(
      { error: 'Proxy error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const endpoint = searchParams.get('endpoint') || '/inventario/'
    const body = await request.json()

    const externalUrl = new URL(endpoint, EXTERNAL_API_BASE)
    console.log('🔄 Proxy PUT to:', externalUrl.toString())

    const response = await fetch(externalUrl.toString(), {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'inventarioUSB-proxy/1.0',
      },
      body: JSON.stringify(body),
      cache: 'no-cache',
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json(
        { error: `External API error: ${response.status} ${response.statusText}`, details: errorText },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })

  } catch (error) {
    console.error('❌ Proxy PUT error:', error)
    return NextResponse.json(
      { error: 'Proxy error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const endpoint = searchParams.get('endpoint') || '/inventario/'

    const externalUrl = new URL(endpoint, EXTERNAL_API_BASE)
    console.log('🔄 Proxy DELETE to:', externalUrl.toString())

    const response = await fetch(externalUrl.toString(), {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'inventarioUSB-proxy/1.0',
      },
      cache: 'no-cache',
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json(
        { error: `External API error: ${response.status} ${response.statusText}`, details: errorText },
        { status: response.status }
      )
    }

    // DELETE puede no devolver contenido
    if (response.status === 204) {
      return new NextResponse(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      })
    }

    const data = await response.json()
    return NextResponse.json(data, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })

  } catch (error) {
    console.error('❌ Proxy DELETE error:', error)
    return NextResponse.json(
      { error: 'Proxy error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  })
}