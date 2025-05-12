
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Users, ShieldQuestion, BarChart3, AlertTriangle, Loader2 } from 'lucide-react';
import Image from 'next/image';
import type { UserProfile } from '@/types'; // Ensure UserProfile is imported

// Define a dummy user for viewing the dashboard when Firebase isn't configured
const DUMMY_USER_FOR_VIEWING: UserProfile = {
  uid: 'dummy-dashboard-viewer-001',
  email: 'viewer@example.com',
  displayName: 'Demo User (Admin View)',
  photoURL: 'https://picsum.photos/seed/demoviewer/40/40',
  phoneNumber: null,
  role: 'admin', // Assign 'admin' role to see all features on the dashboard
};

export default function DashboardPage() {
  const { user: authUser, loading, isConfigured } = useAuth();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient || loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Determine the user profile to render on the dashboard
  const userToRenderOnDashboard: UserProfile | null = (() => {
    if (!isConfigured) {
      // If Firebase is not configured, use the predefined dummy user for viewing
      return DUMMY_USER_FOR_VIEWING;
    }
    // If Firebase is configured, use the actual authenticated user from AuthProvider
    return authUser;
  })();

  // If no user can be determined for the dashboard (e.g., Firebase is configured but no one is logged in),
  // then show an access denied message.
  if (!userToRenderOnDashboard) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>You need to be logged in to view this page.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/login">Go to Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Proceed with rendering the dashboard using userToRenderOnDashboard
  const isAdmin = userToRenderOnDashboard.role === 'admin';

  return (
    <div className="flex-1 space-y-6">
      <div className="flex flex-col items-start justify-between space-y-2 sm:flex-row sm:items-center">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {userToRenderOnDashboard.displayName || 'User'}!
        </p>
      </div>
      
      {!isConfigured && (
         <Card className="mb-6 border-accent bg-accent/10 dark:bg-accent/20">
          <CardHeader>
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-accent" />
              <CardTitle className="text-accent">Demo Mode</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-accent/90 dark:text-accent/80">
              Firebase is not configured. You are viewing the dashboard with sample data. Some interactive features might be limited.
            </p>
          </CardContent>
        </Card>
      )}


      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Your Role
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{userToRenderOnDashboard.role}</div>
            <p className="text-xs text-muted-foreground">
              {isAdmin ? 'Full access to all features.' : 'Standard user access.'}
            </p>
          </CardContent>
        </Card>

        {isAdmin && (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">User Management</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Manage Users</div>
                <p className="text-xs text-muted-foreground mb-2">
                  View, add, edit, or remove users.
                </p>
                <Button asChild size="sm">
                  <Link href="/users">Go to Users</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Config Advisor</CardTitle>
                <ShieldQuestion className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">AI Analyzer</div>
                 <p className="text-xs text-muted-foreground mb-2">
                  Get insights on your app configurations.
                </p>
                <Button asChild size="sm">
                  <Link href="/config-advisor">Analyze Configs</Link>
                </Button>
              </CardContent>
            </Card>
          </>
        )}

        {!isAdmin && (
           <Card>
             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
               <CardTitle className="text-sm font-medium">My Activity</CardTitle>
               <BarChart3 className="h-4 w-4 text-muted-foreground" />
             </CardHeader>
             <CardContent>
               <div className="text-2xl font-bold">Coming Soon</div>
               <p className="text-xs text-muted-foreground">
                 Your recent activity and statistics will appear here.
               </p>
             </CardContent>
           </Card>
        )}
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
          <CardDescription>
            Explore the features and make this template your own.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="flex flex-col items-center justify-center p-6 border rounded-lg text-center">
                <Image src="https://picsum.photos/seed/dashboard1/400/200" alt="Feature placeholder 1" width={400} height={200} className="rounded-md mb-4" data-ai-hint="office team" />
                <h3 className="text-lg font-semibold mb-1">Customize Your Profile</h3>
                <p className="text-sm text-muted-foreground mb-3">Personalize your account details and preferences.</p>
                <Button asChild variant="secondary" size="sm">
                    <Link href="/profile">Go to Profile</Link>
                </Button>
            </div>
            <div className="flex flex-col items-center justify-center p-6 border rounded-lg text-center">
                 <Image src="https://picsum.photos/seed/dashboard2/400/200" alt="Feature placeholder 2" width={400} height={200} className="rounded-md mb-4" data-ai-hint="modern workspace" />
                <h3 className="text-lg font-semibold mb-1">Explore Theme Options</h3>
                <p className="text-sm text-muted-foreground mb-3">Adjust themes, colors, and more via the palette icon in the header.</p>
                {/* Button removed as theme switcher is in header */}
            </div>
        </CardContent>
      </Card>

    </div>
  );
}
