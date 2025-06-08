import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { CheckCircle, AlertCircle, RefreshCw, Database } from 'lucide-react';
import { testDatabaseConnection, getDatabaseStats } from '@/lib/database-test';

export function DatabaseStatus() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const runConnectionTest = async () => {
    setIsLoading(true);
    try {
      const result = await testDatabaseConnection();
      setIsConnected(result);
      
      if (result) {
        const dbStats = await getDatabaseStats();
        setStats(dbStats);
      }
      
      setLastChecked(new Date());
    } catch (error) {
      console.error('Connection test error:', error);
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    runConnectionTest();
  }, []);

  return (
    <Card className="bg-[#2a2a2a] border-gray-700">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Database className="h-5 w-5 text-white" />
            <h3 className="text-lg font-semibold text-white">Database Status</h3>
          </div>
          <Button
            onClick={runConnectionTest}
            disabled={isLoading}
            variant="outline"
            size="sm"
            className="border-gray-600 text-black hover:bg-gray-800 hover:text-white"
          >
            {isLoading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Test Connection
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Connection Status */}
        <div className="flex items-center space-x-3">
          {isConnected === null ? (
            <div className="h-3 w-3 bg-gray-400 rounded-full animate-pulse" />
          ) : isConnected ? (
            <CheckCircle className="h-5 w-5 text-green-400" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-400" />
          )}
          <span className="text-white">
            {isConnected === null 
              ? 'Checking connection...' 
              : isConnected 
                ? 'Database connected successfully' 
                : 'Database connection failed'
            }
          </span>
        </div>

        {/* Database Statistics */}
        {stats && (
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-600">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{stats.total}</div>
              <div className="text-sm text-gray-400">Total Submissions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{stats.recent}</div>
              <div className="text-sm text-gray-400">This Week</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{stats.newsletter}</div>
              <div className="text-sm text-gray-400">Newsletter Signups</div>
            </div>
          </div>
        )}

        {/* Last Checked */}
        {lastChecked && (
          <div className="text-xs text-gray-500 pt-2 border-t border-gray-600">
            Last checked: {lastChecked.toLocaleString()}
          </div>
        )}

        {/* Connection Details */}
        <div className="text-xs text-gray-400 space-y-1">
          <div>Environment: {import.meta.env.MODE}</div>
          <div>Supabase URL: {import.meta.env.VITE_SUPABASE_URL ? '✓ Configured' : '✗ Missing'}</div>
          <div>Anon Key: {import.meta.env.VITE_SUPABASE_ANON_KEY ? '✓ Configured' : '✗ Missing'}</div>
        </div>
      </CardContent>
    </Card>
  );
}