
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-provider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Loader2, AlertTriangle, GitBranch } from 'lucide-react';
import type { UserProfile } from '@/types';
import { useTheme } from '@/contexts/theme-provider';
import { projectConfig } from '@/config/project.config';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { dummyUserForDashboardView } from '@/data/dummy-data';
import { DashboardV1Content } from '@/components/dashboard/dashboard-v1-content';
import { DashboardBetaContent } from '@/components/dashboard/dashboard-beta-content';
import { DashboardDevContent } from '@/components/dashboard/dashboard-dev-content';


export default function DashboardPage() {
  const { user: authUser, loading, isConfigured } = useAuth();
  const { appVersion } = useTheme(); 
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient || loading) {
    return (
      <div className="flex flex-1 items-center justify-center p-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const userToRenderOnDashboard: UserProfile | null = (() => {
    if (!isConfigured) {
      // When not configured, use a specific dummy user intended for dashboard viewing,
      // which is already set with 'admin' role.
      return dummyUserForDashboardView;
    }
    // If configured, use the actual authenticated user.
    // The `authUser` from `useAuth` might already be the previewAdmin if no one is logged in (when not configured).
    // However, for an explicit "not configured" state on the dashboard, dummyUserForDashboardView is clearer.
    return authUser;
  })();

  if (!userToRenderOnDashboard) {
    // This case should ideally not be hit if `isConfigured` logic correctly provides `dummyUserForDashboardView`,
    // or if `authUser` correctly reflects a logged-in user or the preview admin user from AuthProvider.
    // This acts as a fallback.
    return (
      <div className="flex flex-1 items-center justify-center p-4">
        <Card className="w-full max-w-md text-center p-4">
          <CardHeader>
            <CardTitle className="text-xl md:text-2xl">Access Denied</CardTitle>
            <CardDescription>You need to be logged in to view this page, or the application is in a preview state.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/auth/login">Go to Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const renderDashboardContent = () => {
    if (!userToRenderOnDashboard) return null; 

    switch (appVersion) {
      case 'v0.9.0-beta':
        return <DashboardBetaContent userToRenderOnDashboard={userToRenderOnDashboard} />;
      case 'dev':
        return <DashboardDevContent userToRenderOnDashboard={userToRenderOnDashboard} />;
      case 'v1.0.0':
      default:
        return <DashboardV1Content userToRenderOnDashboard={userToRenderOnDashboard} isConfigured={isConfigured} />;
    }
  };

  const versionDetails = projectConfig.availableAppVersions.find(v => v.id === appVersion);

  return (
    <TooltipProvider>
      <div className="space-y-4 md:space-y-6"> {/* Removed flex-1 and adjusted padding */}
        <div className="flex flex-col items-start justify-between space-y-2 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h1>
            {versionDetails && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant={appVersion === 'dev' ? 'destructive' : 'ghost'} 
                    size="icon" 
                    className="h-7 w-7 sm:h-8 sm:w-8" 
                  >
                    {appVersion === 'dev' ? 
                      <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5" /> :  
                      <GitBranch className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />       
                    }
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p className="text-xs">{versionDetails.name}</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Welcome back, {userToRenderOnDashboard.displayName || 'User'}!
          </p>
        </div>
        {renderDashboardContent()}
      </div>
    </TooltipProvider>
  );
}
