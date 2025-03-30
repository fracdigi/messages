import { NextResponse } from 'next/server';

// For static export, this should return a static page with a message
export async function POST() {
  // For static builds, return a placeholder response
  return NextResponse.json({
    status: 'static',
    message: 'This is a static export. API endpoints are not supported.'
  });
}