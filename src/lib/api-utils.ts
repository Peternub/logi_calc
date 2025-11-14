import { NextResponse } from 'next/server'

export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message)
    this.name = 'APIError'
  }
}

export function handleAPIError(error: unknown) {
  console.error('API Error:', error)

  if (error instanceof APIError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code
      },
      { status: error.statusCode }
    )
  }

  if (error instanceof Error) {
    return NextResponse.json(
      {
        error: error.message,
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    )
  }

  return NextResponse.json(
    {
      error: 'Произошла неизвестная ошибка',
      code: 'UNKNOWN_ERROR'
    },
    { status: 500 }
  )
}

export function validateAuth(user: any) {
  if (!user) {
    throw new APIError('Пользователь не аутентифицирован', 401, 'UNAUTHORIZED')
  }
}

export function validateInput(data: any, requiredFields: string[]) {
  const missingFields = requiredFields.filter(field => !data[field])
  
  if (missingFields.length > 0) {
    throw new APIError(
      `Отсутствуют обязательные поля: ${missingFields.join(', ')}`,
      400,
      'MISSING_FIELDS'
    )
  }
}

export function createSuccessResponse(data: any, status: number = 200) {
  return NextResponse.json(data, { status })
}