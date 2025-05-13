
'use client';

import React, { useState, useEffect } from 'react';
import type { UserProfile } from '@/types';
import { useTheme } from '@/contexts/theme-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, Database, Zap, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DashboardDevContentProps {
  userToRenderOnDashboard: UserProfile;
}

export function DashboardDevContent({ userToRenderOnDashboard }: DashboardDevContentProps) {
  const { theme, accentColor, borderRadius } = useTheme();
  const { toast } = useToast();
  const [currentProgress, setCurrentProgress] = useState(67);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentProgress(Math.floor(Math.random() * 101));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleTestNotification = () => {
    toast({
      title: "Test Notification!",
      description: "This is a sample toast message triggered from the dev dashboard.",
      variant: "default",
    });
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <Alert variant="destructive" className="p-3 sm:p-4">
        <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5" />
        <AlertTitle className="text-sm sm:text-base">Developer Build Environment</AlertTitle>
        <AlertDescription className="text-xs sm:text-sm">
          You are viewing the <strong>dev</strong> build. All experimental features are active and may be unstable. Use for testing purposes only.
        </AlertDescription>
      </Alert>
      <div className="grid gap-4 md:gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2"><Database className="h-4 w-4 sm:h-5 sm:w-5 text-primary" /> Current Context</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 sm:space-y-2 text-xs sm:text-sm p-4 pt-0">
            <div><strong>User:</strong> <span className="font-mono break-all">{userToRenderOnDashboard.displayName} ({userToRenderOnDashboard.email})</span></div>
            <div><strong>Role:</strong> <Badge variant={userToRenderOnDashboard.role === 'admin' ? 'default' : 'secondary'} className="text-xs px-1.5 py-0.5">{userToRenderOnDashboard.role}</Badge></div>
            <div><strong>Theme Mode:</strong> <span className="font-mono capitalize">{theme}</span></div>
            <div><strong>Accent:</strong> <span className="font-mono p-1 rounded text-xs" style={{backgroundColor: accentColor.startsWith('#') ? accentColor : `hsl(${accentColor})`, color: 'hsl(var(--accent-foreground))'}}>{accentColor}</span></div>
            <div><strong>Radius:</strong> <span className="font-mono">{borderRadius}</span></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2"><Zap className="h-4 w-4 sm:h-5 sm:w-5 text-primary" /> Developer Tools</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 sm:space-y-3 p-4 pt-0">
            <Button
              variant="outline"
              className="w-full text-xs sm:text-sm h-8 sm:h-9"
              onClick={handleTestNotification}
            >
              <MessageSquare className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              Trigger Test Notification
            </Button>
            <Button variant="outline" className="w-full text-xs sm:text-sm h-8 sm:h-9">Simulate API Error</Button>
            <div className="mt-1 sm:mt-2">
              <label htmlFor="stability" className="text-xs sm:text-sm font-medium text-muted-foreground">System Stability Monitor (Dummy):</label>
              <Progress id="stability" value={currentProgress} className="w-full mt-1 h-3 sm:h-4" />
              <p className="text-xs text-muted-foreground text-right">{currentProgress}% Stable</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
