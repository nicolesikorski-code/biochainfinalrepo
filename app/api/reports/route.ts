import { NextRequest, NextResponse } from 'next/server';
import { generateReport } from '@/lib/generate-report';
import { extractQueryFromMessages } from '@/lib/mock-ai';

export async function POST(request: NextRequest) {
  try {
    const { researcherId, query, messages } = await request.json();

    if (!researcherId) {
      return NextResponse.json(
        { error: 'Researcher ID is required' },
        { status: 400 }
      );
    }

    // Extract query from messages if not provided
    const finalQuery = query || (messages ? extractQueryFromMessages(messages) : 'Reporte general');

    // Generate report using the real function
    const report = await generateReport(researcherId, finalQuery);

    return NextResponse.json({
      success: true,
      report,
    });
  } catch (error: any) {
    console.error('Reports API error:', error);

    // Handle specific errors
    if (error.message?.includes('Créditos insuficientes')) {
      return NextResponse.json(
        { error: error.message },
        { status: 402 } // Payment Required
      );
    }

    if (error.message?.includes('No hay suficientes datos')) {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Error al generar el reporte' },
      { status: 500 }
    );
  }
}
