
'use client';

import React, { useState, useEffect } from 'react'; // Import React, useState, useEffect
import { useAuth } from '@/contexts/auth-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Users, ShieldQuestion, BarChart3, AlertTriangle, Loader2 } from 'lucide-react';
import Image from 'next/image';

export default function DashboardPage() {
  const { user, loading, isConfigured } = useAuth();
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

  if (!isConfigured) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Card className="w-full max-w-lg text-center">
          <CardHeader>
            <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
            <CardTitle>Configuration Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Firebase is not configured correctly. Please contact an administrator or check your setup.
              The application functionality may be limited.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (!user) {
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

  const isAdmin = user.role === 'admin';

  return (
    <div className="flex-1 space-y-6">
      <div className="flex flex-col items-start justify-between space-y-2 sm:flex-row sm:items-center">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user.displayName || 'User'}!
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Your Role
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{user.role}</div>
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
            </div>
        </CardContent>
      </Card>

    </div>
  );
}
