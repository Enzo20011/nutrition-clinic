import { NextResponse } from 'next/server';

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function apiSuccess<T>(data: T, pagination?: PaginationMeta, status = 200) {
  return NextResponse.json(
    {
      success: true,
      data,
      ...(pagination && { pagination }),
    },
    { status }
  );
}

export function apiError(message: string, status = 500, details?: any) {
  return NextResponse.json(
    {
      success: false,
      error: message,
      ...(details && { details }),
    },
    { status }
  );
}
