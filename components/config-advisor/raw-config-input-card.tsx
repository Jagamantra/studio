
'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

interface RawConfigInputCardProps {
  sidebarConfigContent: string;
  handleSidebarChange: (value: string) => void;
  rolesConfigContent: string;
  handleRolesChange: (value: string) => void;
  showPlaceholders: boolean;
  placeholderSidebarConfigData: string;
  placeholderRolesConfigData: string;
  anyLoading: boolean;
}

export function RawConfigInputCard({
  sidebarConfigContent,
  handleSidebarChange,
  rolesConfigContent,
  handleRolesChange,
  showPlaceholders,
  placeholderSidebarConfigData,
  placeholderRolesConfigData,
  anyLoading,
}: RawConfigInputCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl md:text-2xl">Raw Configuration Files</CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Paste the content of your other configuration files below for AI analysis.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label htmlFor="sidebarConfig" className="block text-sm font-medium mb-1">
            sidebar.config.ts
          </label>
          <Textarea
            id="sidebarConfig"
            placeholder={showPlaceholders && !sidebarConfigContent ? placeholderSidebarConfigData : "Paste content of sidebar.config.ts here..."}
            value={sidebarConfigContent}
            onChange={(e) => handleSidebarChange(e.target.value)}
            rows={8}
            className="font-mono text-xs min-h-[100px] sm:min-h-[150px]"
            disabled={anyLoading}
          />
        </div>
        <div>
          <label htmlFor="rolesConfig" className="block text-sm font-medium mb-1">
            roles.config.ts
          </label>
          <Textarea
            id="rolesConfig"
            placeholder={showPlaceholders && !rolesConfigContent ? placeholderRolesConfigData : "Paste content of roles.config.ts here..."}
            value={rolesConfigContent}
            onChange={(e) => handleRolesChange(e.target.value)}
            rows={8}
            className="font-mono text-xs min-h-[100px] sm:min-h-[150px]"
            disabled={anyLoading}
          />
        </div>
      </CardContent>
      <CardFooter>
        <p className="text-xs text-muted-foreground">
          Note: The AI analysis is based on general best practices and the provided content. Always review suggestions carefully before implementing.
        </p>
      </CardFooter>
    </Card>
  );
}
