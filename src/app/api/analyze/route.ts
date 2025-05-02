import { NextRequest, NextResponse } from 'next/server';

/**
 * Proxy route for the variant analysis API to avoid CORS issues
 */
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const variant_position = searchParams.get('variant_position');
    const alternative = searchParams.get('alternative');
    const genome = searchParams.get('genome');
    const chromosome = searchParams.get('chromosome');

    if (!variant_position || !alternative || !genome || !chromosome) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Get the URL from environment variable or use a fallback
    const baseUrl = process.env.NEXT_PUBLIC_ANALYZE_SINGLE_VARIANT_BASE_URL;
    if (!baseUrl) {
      return NextResponse.json(
        { error: 'Variant analysis API URL is not configured' },
        { status: 500 }
      );
    }

    // Forward the request to the actual API
    const apiUrl = new URL(baseUrl);
    apiUrl.searchParams.set('variant_position', variant_position);
    apiUrl.searchParams.set('alternative', alternative);
    apiUrl.searchParams.set('genome', genome);
    apiUrl.searchParams.set('chromosome', chromosome);

    const apiResponse = await fetch(apiUrl.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      return NextResponse.json(
        { error: `API error: ${errorText}` },
        { status: apiResponse.status }
      );
    }

    const data = await apiResponse.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error in analyze API route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 