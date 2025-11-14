import { NextRequest, NextResponse } from 'next/server';
import { securityManager } from '../../../config/security';
import { withRateLimit, rateLimiters } from '../../../middleware/rate-limiting';

// Security audit endpoint
async function handleSecurityAudit(req: NextRequest) {
  try {
    console.log('🔍 Starting security audit...');
    
    const auditResult = await securityManager.runSecurityAudit();
    
    return NextResponse.json({
      success: true,
      data: auditResult,
      message: 'Security audit completed successfully',
    });
  } catch (error) {
    console.error('Security audit error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to complete security audit',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Security report endpoint
async function handleSecurityReport(req: NextRequest) {
  try {
    console.log('📊 Generating security report...');
    
    const report = await securityManager.generateSecurityReport();
    
    return NextResponse.json({
      success: true,
      data: report,
      message: 'Security report generated successfully',
    });
  } catch (error) {
    console.error('Security report error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate security report',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Security configuration validation endpoint
async function handleConfigValidation(req: NextRequest) {
  try {
    console.log('⚙️ Validating security configuration...');
    
    const validation = securityManager.validateSecurityConfig();
    
    return NextResponse.json({
      success: true,
      data: validation,
      message: 'Security configuration validation completed',
    });
  } catch (error) {
    console.error('Config validation error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to validate security configuration',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// CSRF token endpoint
async function handleCSRFToken(req: NextRequest) {
  try {
    const token = await securityManager.getCSRFToken();
    
    const response = NextResponse.json({
      success: true,
      token,
      message: 'CSRF token generated successfully',
    });

    // Set CSRF token cookie
    response.cookies.set('csrf-token', token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return response;
  } catch (error) {
    console.error('CSRF token error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate CSRF token',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Input validation endpoint
async function handleInputValidation(req: NextRequest) {
  try {
    const body = await req.json();
    const { value, type } = body;

    if (!value || !type) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: value and type',
        },
        { status: 400 }
      );
    }

    const validation = securityManager.validateInput(value, type);
    
    return NextResponse.json({
      success: true,
      data: validation,
      message: 'Input validation completed',
    });
  } catch (error) {
    console.error('Input validation error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to validate input',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Main handler
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const action = url.searchParams.get('action');

  switch (action) {
    case 'audit':
      return withRateLimit(rateLimiters.api, handleSecurityAudit)(req);
    
    case 'report':
      return withRateLimit(rateLimiters.api, handleSecurityReport)(req);
    
    case 'validate-config':
      return withRateLimit(rateLimiters.api, handleConfigValidation)(req);
    
    case 'csrf-token':
      return withRateLimit(rateLimiters.api, handleCSRFToken)(req);
    
    default:
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid action',
          availableActions: ['audit', 'report', 'validate-config', 'csrf-token'],
        },
        { status: 400 }
      );
  }
}

export async function POST(req: NextRequest) {
  const url = new URL(req.url);
  const action = url.searchParams.get('action');

  switch (action) {
    case 'validate-input':
      return withRateLimit(rateLimiters.api, handleInputValidation)(req);
    
    default:
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid action for POST method',
          availableActions: ['validate-input'],
        },
        { status: 400 }
      );
  }
}