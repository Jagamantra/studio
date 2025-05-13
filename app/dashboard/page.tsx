
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-provider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Loader2, AlertTriangle, GitBranch, Info } from 'lucide-react';
import type { UserProfile } from '@/types';
import { useTheme } from '@/contexts/theme-provider';
import { projectConfig } from '@/config/project.config';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { dummyUserForDashboardView } from '@/data/dummy-data';
import { DashboardV1Content } from '@/components/dashboard/dashboard-v1-content';
import { DashboardBetaContent } from '@/components/dashboard/dashboard-beta-content';
import { DashboardDevContent } from '@/components/dashboard/dashboard-dev-content';
import { AuthenticatedPageLayout } from '@/components/layout/authenticated-page-layout';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { PageTitleWithIcon } from '@/components/layout/page-title-with-icon';


export default function DashboardPage() {
  const { user: authUser, loading, isConfigured } = useAuth();
  const { appName, appVersion } = useTheme(); 
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    // Set document title dynamically
    if (appName && isClient) {
      document.title = `Dashboard | ${appName}`;
    }
  }, [appName, isClient]);

  useEffect(() => {
    if (!isClient) return;

    const toastMessageKey = 'toast_message';
    const messageType = searchParams.get(toastMessageKey);
    
    if (messageType === 'access_denied_role') {
      toast({
        title: 'Access Denied',
        message: 'You do not have permission for the requested page.',
        variant: 'destructive',
      });
      // Clean up the URL by removing the toast_message query parameter
      // This ensures the toast doesn't reappear on refresh if the user stays on the dashboard.
      const currentPath = window.location.pathname;
      const params = new URLSearchParams(searchParams.toString());
      if (params.has(toastMessageKey)) {
          params.delete(toastMessageKey);
          const newUrl = params.toString() ? `${currentPath}?${params.toString()}` : currentPath;
          // Using replace to avoid adding to browser history.
          // Using { shallow: true } is important if you don't want to re-run data fetching,
          // but in this case, we are just cleaning the URL.
          router.replace(newUrl, { shallow: true }); 
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, isClient]); // Removed toast and router from deps as they are stable

  if (!isClient || loading) {
    return (
      <AuthenticatedPageLayout>
        <div className="flex flex-1 items-center justify-center p-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AuthenticatedPageLayout>
    );
  }

  const userToRenderOnDashboard: UserProfile | null = (() => {
    if (!isConfigured) {
      return dummyUserForDashboardView;
    }
    return authUser;
  })();

  if (!userToRenderOnDashboard) {
    return (
      <AuthenticatedPageLayout>
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
      </AuthenticatedPageLayout>
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
        return <DashboardV1Content userToRenderOnDashboard={userToRenderOnDashboard} />;
    }
  };

  const versionDetails = projectConfig.availableAppVersions.find(v => v.id === appVersion);

  return (
    <AuthenticatedPageLayout>
      <TooltipProvider>
        <div className="space-y-4 md:space-y-6">
           <PageTitleWithIcon title="Dashboard">
            <div className="flex items-center gap-2">
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
              <p className="text-xs sm:text-sm text-muted-foreground">
                Welcome back, {userToRenderOnDashboard.displayName || 'User'}!
              </p>
            </div>
          </PageTitleWithIcon>

          {!isConfigured && ( 
            <Card className="mb-4 md:mb-6 border-primary bg-primary/10 dark:bg-primary/20">
                <CardHeader className="p-4">
                <div className="flex items-center gap-2 sm:gap-3">
                    <Info className="h-5 w-5 sm:h-6 sm:w-6 text-primary" /> 
                    <CardTitle className="text-base sm:text-lg text-primary">Application Status: Mock Mode</CardTitle> 
                </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                <p className="text-xs sm:text-sm text-primary/90 dark:text-primary/80">
                    This application is currently running with mock API services and dummy data. 
                    All features are available for demonstration. The frontend is designed to be responsive and separate from backend concerns.
                </p>
                </CardContent>
            </Card>
          )}
          {renderDashboardContent()}
        </div>
      </TooltipProvider>
    </AuthenticatedPageLayout>
  );
}

