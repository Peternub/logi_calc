'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  Download,
  Eye,
  Lock,
  UserCheck,
  Globe,
  Database
} from 'lucide-react';

interface SecurityAuditResult {
  overallScore: number;
  vulnerabilities: Array<{
    id: string;
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    location: string;
    recommendation: string;
    fixed: boolean;
  }>;
  passedChecks: number;
  totalChecks: number;
  recommendations: string[];
  timestamp: string;
}

interface SecurityReport {
  timestamp: string;
  environment: string;
  auditResults: SecurityAuditResult;
  configValidation: {
    valid: boolean;
    errors: string[];
    warnings: string[];
  };
  systemHealth: {
    uptime: number;
    memoryUsage: any;
    nodeVersion: string;
  };
  recommendations: string[];
}

export default function SecurityDashboard() {
  const [auditResult, setAuditResult] = useState<SecurityAuditResult | null>(null);
  const [securityReport, setSecurityReport] = useState<SecurityReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch security audit
  const runSecurityAudit = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/security?action=audit');
      const result = await response.json();

      if (result.success) {
        setAuditResult(result.data);
      } else {
        setError(result.error || 'Failed to run security audit');
      }
    } catch (err) {
      setError('Network error while running security audit');
      console.error('Security audit error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Generate security report
  const generateSecurityReport = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/security?action=report');
      const result = await response.json();

      if (result.success) {
        setSecurityReport(result.data);
      } else {
        setError(result.error || 'Failed to generate security report');
      }
    } catch (err) {
      setError('Network error while generating security report');
      console.error('Security report error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Auto-run audit on component mount
  useEffect(() => {
    runSecurityAudit();
  }, []);

  // Severity color mapping
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  // Security score color
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Format uptime
  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8 text-blue-600" />
            Security Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Monitor and manage application security
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={runSecurityAudit} 
            disabled={loading}
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Run Audit
          </Button>
          
          <Button 
            onClick={generateSecurityReport} 
            disabled={loading}
            variant="outline"
          >
            <Download className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="vulnerabilities">Vulnerabilities</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="system">System Health</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {auditResult && (
            <>
              {/* Security Score */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Security Score
                  </CardTitle>
                  <CardDescription>
                    Overall security assessment of the application
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`text-4xl font-bold ${getScoreColor(auditResult.overallScore)}`}>
                      {auditResult.overallScore}%
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">
                        {auditResult.passedChecks} of {auditResult.totalChecks} checks passed
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Last updated: {new Date(auditResult.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <Progress 
                    value={auditResult.overallScore} 
                    className="h-2"
                  />
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div>
                        <div className="font-semibold">Passed Checks</div>
                        <div className="text-2xl font-bold text-green-600">
                          {auditResult.passedChecks}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-5 w-5 text-red-600" />
                      <div>
                        <div className="font-semibold">Vulnerabilities</div>
                        <div className="text-2xl font-bold text-red-600">
                          {auditResult.vulnerabilities.length}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-orange-600" />
                      <div>
                        <div className="font-semibold">Critical Issues</div>
                        <div className="text-2xl font-bold text-orange-600">
                          {auditResult.vulnerabilities.filter(v => v.severity === 'critical').length}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Eye className="h-5 w-5 text-blue-600" />
                      <div>
                        <div className="font-semibold">Recommendations</div>
                        <div className="text-2xl font-bold text-blue-600">
                          {auditResult.recommendations.length}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="vulnerabilities" className="space-y-4">
          {auditResult?.vulnerabilities.map((vulnerability, index) => (
            <Card key={vulnerability.id || index}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    {vulnerability.description}
                  </CardTitle>
                  <Badge variant={getSeverityColor(vulnerability.severity)}>
                    {vulnerability.severity.toUpperCase()}
                  </Badge>
                </div>
                <CardDescription>
                  Location: {vulnerability.location}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <strong>Type:</strong> {vulnerability.type}
                  </div>
                  <div>
                    <strong>Recommendation:</strong> {vulnerability.recommendation}
                  </div>
                  <div className="flex items-center gap-2">
                    <strong>Status:</strong>
                    {vulnerability.fixed ? (
                      <Badge variant="secondary" className="text-green-600">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Fixed
                      </Badge>
                    ) : (
                      <Badge variant="destructive">
                        <XCircle className="h-3 w-3 mr-1" />
                        Open
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {auditResult?.vulnerabilities.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Vulnerabilities Found</h3>
                <p className="text-muted-foreground">
                  Great job! No security vulnerabilities were detected in the current audit.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          {auditResult?.recommendations.map((recommendation, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">{recommendation}</div>
                </div>
              </CardContent>
            </Card>
          ))}

          {auditResult?.recommendations.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Recommendations</h3>
                <p className="text-muted-foreground">
                  Your security configuration looks good! No additional recommendations at this time.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          {securityReport && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>System Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <div className="text-sm font-medium">Environment</div>
                      <div className="text-2xl font-bold capitalize">
                        {securityReport.environment}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">Uptime</div>
                      <div className="text-2xl font-bold">
                        {formatUptime(securityReport.systemHealth.uptime)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">Node.js Version</div>
                      <div className="text-2xl font-bold">
                        {securityReport.systemHealth.nodeVersion}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Configuration Validation</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      {securityReport.configValidation.valid ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                      <span className="font-medium">
                        Configuration {securityReport.configValidation.valid ? 'Valid' : 'Invalid'}
                      </span>
                    </div>

                    {securityReport.configValidation.errors.length > 0 && (
                      <div>
                        <h4 className="font-medium text-red-600 mb-2">Errors:</h4>
                        <ul className="space-y-1">
                          {securityReport.configValidation.errors.map((error, index) => (
                            <li key={index} className="text-sm text-red-600 flex items-center gap-2">
                              <XCircle className="h-3 w-3" />
                              {error}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {securityReport.configValidation.warnings.length > 0 && (
                      <div>
                        <h4 className="font-medium text-yellow-600 mb-2">Warnings:</h4>
                        <ul className="space-y-1">
                          {securityReport.configValidation.warnings.map((warning, index) => (
                            <li key={index} className="text-sm text-yellow-600 flex items-center gap-2">
                              <AlertTriangle className="h-3 w-3" />
                              {warning}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}