import { NextRequest, NextResponse } from 'next/server';
import { createUSDCTrustline } from '@/lib/stellar';

export async function POST(request: NextRequest) {
  try {
    const { privateKey } = await request.json();

    if (!privateKey) {
      return NextResponse.json(
        { error: 'Private key is required' },
        { status: 400 }
      );
    }

    const result = await createUSDCTrustline(privateKey);

    return NextResponse.json({
      success: true,
      message: 'USDC trustline created successfully',
      transactionHash: result.transactionHash,
    });
  } catch (error: any) {
    console.error('Create trustline API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create trustline' },
      { status: 500 }
    );
  }
}
