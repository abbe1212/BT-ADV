'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface DiagnosticResult {
  test: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: string;
}

export default function DiagnosticsPage() {
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    runDiagnostics();
  }, []);

  const runDiagnostics = async () => {
    const supabase = createClient();
    const diagnostics: DiagnosticResult[] = [];

    // Test 1: Check authentication
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      
      if (user) {
        diagnostics.push({
          test: 'Authentication',
          status: 'success',
          message: 'User is authenticated',
          details: `User ID: ${user.id}\nEmail: ${user.email}`
        });

        // Check if this user has admin role
        try {
          const { data: roleData, error: roleError } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id)
            .single();

          if (roleError || !roleData) {
            diagnostics.push({
              test: 'Admin Role Check',
              status: 'error',
              message: 'User is NOT in user_roles table',
              details: `Your user (${user.email}) is authenticated but not registered as an admin.\n\nFIX:\n1. Go to Supabase SQL Editor\n2. Run: INSERT INTO user_roles (user_id, role) VALUES ('${user.id}', 'super_admin');\n3. Refresh this page`
            });
          } else {
            diagnostics.push({
              test: 'Admin Role Check',
              status: 'success',
              message: `User has ${roleData.role} role`,
              details: `You are registered as an admin in the user_roles table ✓`
            });
          }
        } catch (error: any) {
          diagnostics.push({
            test: 'Admin Role Check',
            status: 'error',
            message: 'Failed to check admin role',
            details: error.message
          });
        }
      } else {
        diagnostics.push({
          test: 'Authentication',
          status: 'error',
          message: 'No user authenticated',
          details: 'You must be logged in to use the admin panel'
        });
      }
    } catch (error: any) {
      diagnostics.push({
        test: 'Authentication',
        status: 'error',
        message: 'Authentication check failed',
        details: error.message
      });
    }

    // Test 2: Check if user_roles table exists
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .limit(1);
      
      if (error) {
        diagnostics.push({
          test: 'User Roles Table',
          status: 'error',
          message: 'Cannot access user_roles table',
          details: error.message
        });
      } else {
        diagnostics.push({
          test: 'User Roles Table',
          status: 'success',
          message: 'Table exists and is accessible'
        });
      }
    } catch (error: any) {
      diagnostics.push({
        test: 'User Roles Table',
        status: 'error',
        message: 'Failed to check user_roles table',
        details: error.message
      });
    }

    // Test 3: Check RLS policies on works table
    try {
      const { data, error } = await supabase
        .from('works')
        .select('id')
        .limit(1);
      
      if (error) {
        diagnostics.push({
          test: 'Works Table Read Access',
          status: 'error',
          message: 'Cannot read from works table',
          details: error.message
        });
      } else {
        diagnostics.push({
          test: 'Works Table Read Access',
          status: 'success',
          message: 'Can read from works table',
          details: `Found ${data?.length || 0} work(s)`
        });
      }
    } catch (error: any) {
      diagnostics.push({
        test: 'Works Table Read Access',
        status: 'error',
        message: 'Failed to read works table',
        details: error.message
      });
    }

    // Test 4: Try to update a work (if one exists)
    try {
      const { data: works } = await supabase
        .from('works')
        .select('id, title_en')
        .limit(1);
      
      if (works && works.length > 0) {
        const testWork = works[0];
        const { error } = await supabase
          .from('works')
          .update({ title_en: testWork.title_en }) // Update with same value (no-op)
          .eq('id', testWork.id);
        
        if (error) {
          diagnostics.push({
            test: 'Works Table Write Access',
            status: 'error',
            message: 'Cannot update works table',
            details: `Error: ${error.message}\n\nThis usually means:\n1. RLS policies not applied, OR\n2. You are not in the user_roles table as admin, OR\n3. The is_admin() function is not working`
          });
        } else {
          diagnostics.push({
            test: 'Works Table Write Access',
            status: 'success',
            message: 'Can update works table',
            details: 'You have admin permissions!'
          });
        }
      } else {
        diagnostics.push({
          test: 'Works Table Write Access',
          status: 'warning',
          message: 'No works found to test update',
          details: 'Create a work first to test write permissions'
        });
      }
    } catch (error: any) {
      diagnostics.push({
        test: 'Works Table Write Access',
        status: 'error',
        message: 'Failed to test write access',
        details: error.message
      });
    }

    // Test 5: Check environment variables
    const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
    const hasKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (hasUrl && hasKey) {
      diagnostics.push({
        test: 'Environment Variables',
        status: 'success',
        message: 'Supabase credentials configured',
        details: `URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL}`
      });
    } else {
      diagnostics.push({
        test: 'Environment Variables',
        status: 'error',
        message: 'Missing Supabase credentials',
        details: `URL present: ${hasUrl}\nKey present: ${hasKey}`
      });
    }

    setResults(diagnostics);
    setLoading(false);
  };

  const getStatusColor = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success': return 'bg-green-500/10 border-green-500 text-green-400';
      case 'warning': return 'bg-yellow-500/10 border-yellow-500 text-yellow-400';
      case 'error': return 'bg-red-500/10 border-red-500 text-red-400';
    }
  };

  const getStatusIcon = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success': return '✓';
      case 'warning': return '⚠';
      case 'error': return '✗';
    }
  };

  return (
    <div className="min-h-screen bg-[#00203C] p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">🔍 Admin Panel Diagnostics</h1>
          <p className="text-white/60">Check if your Supabase setup is configured correctly</p>
        </div>

        {loading ? (
          <div className="bg-[#0A1F33] border border-[#14304A] rounded-xl p-8 text-center">
            <div className="animate-spin w-12 h-12 border-4 border-[#FFEE34] border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-white/60">Running diagnostics...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {results.map((result, index) => (
              <div
                key={index}
                className={`border rounded-xl p-6 ${getStatusColor(result.status)}`}
              >
                <div className="flex items-start gap-4">
                  <div className="text-2xl">{getStatusIcon(result.status)}</div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1">{result.test}</h3>
                    <p className="mb-2">{result.message}</p>
                    {result.details && (
                      <pre className="text-sm opacity-80 whitespace-pre-wrap bg-black/20 p-3 rounded mt-2 font-mono">
                        {result.details}
                      </pre>
                    )}
                  </div>
                </div>
              </div>
            ))}

            <div className="bg-[#0A1F33] border border-[#14304A] rounded-xl p-6 mt-8">
              <h3 className="font-bold text-white text-lg mb-4">📚 Next Steps</h3>
              <div className="space-y-2 text-white/80">
                <p>If you see errors above, follow these guides:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li><code className="text-[#FFEE34]">SETUP.md</code> - Complete setup guide</li>
                  <li><code className="text-[#FFEE34]">TROUBLESHOOTING.md</code> - Fix common issues</li>
                  <li><code className="text-[#FFEE34]">supabase-rls-policies.sql</code> - RLS policies to apply</li>
                </ul>
              </div>
            </div>

            <div className="text-center mt-6">
              <button
                onClick={() => {
                  setLoading(true);
                  runDiagnostics();
                }}
                className="bg-[#FFEE34] text-[#00203C] px-6 py-3 rounded-lg font-bold hover:bg-white transition-colors"
              >
                🔄 Re-run Diagnostics
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
