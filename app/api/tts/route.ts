import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const text = searchParams.get('text');
  const lang = searchParams.get('lang') || 'vi';

  if (!text || text.trim().length === 0) {
    return NextResponse.json({ error: 'Text parameter is required' }, { status: 400 });
  }

  // Google Translate TTS accepts max ~180-200 characters per request
  const sanitizedText = text.slice(0, 200).trim();
  const googleTtsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${encodeURIComponent(lang)}&client=tw-ob&q=${encodeURIComponent(sanitizedText)}`;

  try {
    const res = await fetch(googleTtsUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        Referer: 'https://translate.google.com/',
      },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Upstream TTS service returned ${res.status}` },
        { status: res.status }
      );
    }

    const audioBuffer = await res.arrayBuffer();
    return new Response(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Failed to fetch TTS audio stream' },
      { status: 500 }
    );
  }
}
