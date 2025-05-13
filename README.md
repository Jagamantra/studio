
# Genesis Template

Welcome to the Genesis Template! This Next.js starter is built for speed and flexibility, featuring a mock API service for backend interactions.

## Getting Started

Follow these steps to run the Genesis Template locally:

1.  **Clone & Install**:
    *   If you haven't already, clone this repository.
    *   Install dependencies:
        ```bash
        npm install
        # or yarn install / pnpm install
        ```

2.  **Environment Variables**:
    *   Copy the `.env` file to `.env.local`:
        ```bash
        cp .env .env.local
        ```
    *   The `.env.local` file is for your local settings and is ignored by Git.
    *   The main variable here is `NEXT_PUBLIC_API_BASE_URL`. Initially, you can leave this as is, because the app uses an internal mock API.
    *   When you're ready to connect to your actual backend, update this URL (e.g., `NEXT_PUBLIC_API_BASE_URL="http://localhost:3001/api"`).

3.  **Run the App**:
    *   Start the development server:
        ```bash
        npm run dev
        # or yarn dev / pnpm dev
        ```
    *   The app usually runs on `http://localhost:9002`.

4.  **Explore**:
    *   The app will redirect to `/auth/login`.
    *   **Default Mock Credentials**:
        *   Admin: `admin@dummy.com` / `password123`
        *   User: `user@dummy.com` / `password123`
    *   You can register new dummy users. Their data is stored in your browser's Local Storage.
    *   Key features: Theme Switcher, Profile Editor, (Mock) Role-Based Access Control, Dynamic Sidebar, AI Config Advisor.

## Core Features

-   **Theme Switcher**: Change themes (dark/light), accent colors, and border radius. Find it via the palette icon in the header.
-   **Profile Editor**: Manage user profiles (details, password) using mock services.
-   **Access Control**: (Mocked) Role-based route access. Configure in `config/roles.config.ts`.
-   **Dynamic Sidebar**: Navigation configured in `config/sidebar.config.ts`.
-   **Config Advisor**: (Admin-only) AI tool to analyze app configuration files. Enable/disable in `config/project.config.ts`.

## Genkit for AI

The app uses Genkit for AI features like the Config Advisor.
-   Genkit flows are in `ai/flows/`.
-   To run Genkit locally for development:
    ```bash
    npm run genkit:dev
    # or for live reloading:
    npm run genkit:watch
    ```

## Mock API & Data Persistence

This template uses a **mock API service** (`services/api.ts`) and dummy data (`data/dummy-data.ts`). This lets you build the entire frontend without a real backend.

**Data is stored in your browser's Local Storage**:
-   **User Session & Details**:
    *   `genesis_current_dummy_user`: Current logged-in (dummy) user's profile.
    *   `genesis_mfa_verified`: Mock MFA status.
-   **Dummy User Database**:
    *   `genesis_dummy_users`: All registered dummy users.
-   **Theme Settings**:
    *   `genesis-theme-mode`, `genesis-theme-accent`, `genesis-theme-radius`, `genesis-theme-version`, `genesis-theme-app-name`, `genesis-theme-app-icon-paths`.
-   **Config Advisor Inputs**:
    *   `configAdvisorInputs`: User inputs for the Config Advisor.

**Note**: Local Storage is for the mock setup. A real backend would store this data in a database.

## Application Configuration

Key configurations are in the `config/` directory.

### 1. Project-Wide Settings (`config/project.config.ts`)

This file (`projectConfig`) controls:

-   **`appName: string`**: Your application's name. Used in headers, tab titles, etc. Can be updated at runtime (e.g., via Config Advisor) and is persisted in Local Storage.
-   **`appIconPaths: string[]`**: SVG path `d` attributes for the main app icon (shown in header and next to page titles). If empty, a generic document icon is used.
    *   **Browser Tab Icon (Favicon)**: To change the browser tab icon, replace `public/favicon.svg`. `appIconPaths` updates the in-app icon only.
-   **`availableAccentColors` & `defaultAccentColorName`**: Predefined accent colors for the Theme Switcher.
-   **`availableBorderRadii` & `defaultBorderRadiusName`**: Border radius options.
-   **`availableAppVersions` & `defaultAppVersionId`**: Define different app "versions" (e.g., 'v1.0.0', 'beta'). Affects UI/features (see Dashboard).
-   **`enableConfigAdvisor: boolean`**: Toggle the AI Config Advisor feature (default: `true`). If `false`, links/cards are hidden, and direct access shows a "disabled" message.

### 2. Theme Customization (Runtime)

Users can customize:
-   **Mode**: Light, Dark, System.
-   **Accent Color**: Predefined or custom HEX.
-   **Border Radius**: Predefined options.
Managed by `contexts/theme-provider.tsx`, saved in Local Storage.

### 3. Sidebar Navigation (`config/sidebar.config.ts`)

Defines sidebar items:
-   `id`, `label`, `href`, `icon` (Lucide), `roles?` (access control), `subItems?` (nested menus), `disabled?`.
-   Dynamically rendered based on config and user role.

### 4. Role-Based Access Control (RBAC) (`config/roles.config.ts`)

-   **`roles: Role[]`**: Available roles (e.g., `admin`, `user`).
-   **`routePermissions: Record<string, Role[]>`**: Maps routes to allowed roles (e.g., `'/users': ['admin']`).
-   **`defaultRole: Role`**: Role for new (dummy) users.

## Connecting to Your Backend API

To switch from the mock API to your real backend:

1.  **Set API Base URL**:
    *   In `.env.local`, set `NEXT_PUBLIC_API_BASE_URL` to your backend's URL (e.g., `https://your-api.com/v1`).
    *   Restart your Next.js server.

2.  **Update API Service Functions (`services/api.ts`)**:
    *   This file currently has mock functions (e.g., `fetchUsers`, `addUser`).
    *   Modify these to make real HTTP requests to your backend endpoints. `apiClient` (an Axios instance) is already set up.
    *   **Example - Modifying `fetchUsers`**:
        ```typescript
        // Before (Mock)
        // export const fetchUsers = async (): Promise<UserProfile[]> => {
        //   return Promise.resolve([...currentMockUsers]);
        // };

        // After (Real API Call)
        import type { UserProfile } from '@/types';
        export const fetchUsers = async (): Promise<UserProfile[]> => {
          try {
            const response = await apiClient.get('/users'); // Your endpoint
            return response.data;
          } catch (error) {
            console.error('Error fetching users:', error);
            throw error;
          }
        };
        ```
    *   Update all relevant functions in `services/api.ts` to match your backend's API.

3.  **Authentication**:
    *   Replace the dummy auth in `contexts/auth-provider.tsx` and `services/api.ts` (mock `loginUser`, `registerUser`) with your backend's auth.
    *   Modify `loginUser`, `registerUser` in `services/api.ts` to call your auth endpoints.
    *   Adjust `contexts/auth-provider.tsx` to handle tokens (e.g., JWTs) from your backend.
    *   Configure `apiClient` in `services/api.ts` to include auth tokens in requests (e.g., via Authorization headers).

4.  **Data Types**:
    *   Ensure TypeScript types in `types/index.ts` (e.g., `UserProfile`) match your API's data structures.

## Adding a New Page

Guide to adding new pages:

### 1. Create the Page File

-   Create a new `.tsx` file in the `app/` directory. For example, `app/my-new-page/page.tsx` (accessible at `/my-new-page`).
-   Use Next.js App Router conventions. Authenticated pages typically use `AuthenticatedPageLayout`.

**Example:** `app/my-new-page/page.tsx`
```tsx
// app/my-new-page/page.tsx
'use client';

import React from 'react';
import { AuthenticatedPageLayout } from '@/components/layout/authenticated-page-layout';
import { PageTitleWithIcon } from '@/components/layout/page-title-with-icon';

const MyNewPage = () => {
  return (
    <AuthenticatedPageLayout>
      <PageTitleWithIcon title="My New Page Title" />
      <div>
        <p>Page content goes here.</p>
      </div>
    </AuthenticatedPageLayout>
  );
};

export default MyNewPage;
```

### 2. Add to Sidebar (Optional)

-   Update `config/sidebar.config.ts`. Import icons and add a `SidebarNavItem`.
```typescript
// config/sidebar.config.ts
import type { SidebarConfig, SidebarNavItem } from '@/types';
import { PlusCircle, /* other icons */ } from 'lucide-react';
// ...
const sidebarItems: SidebarNavItem[] = [
  // ... other items
  {
    id: 'mynewpage',
    label: 'My New Page',
    href: '/my-new-page', // Matches file structure
    icon: PlusCircle,
    roles: ['admin', 'user'], // Adjust as needed
  },
];
// ...
export const sidebarConfig: SidebarConfig = { items: sidebarItems };
```

### 3. Configure Route Permissions (Optional)

-   Update `config/roles.config.ts` if the page needs specific role access.
```typescript
// config/roles.config.ts
// ...
export const rolesConfig: RolesConfig = {
  // ...
  routePermissions: {
    // ... other permissions
    '/my-new-page': ['admin', 'user'], // Added permission
  },
  // ...
};
```

### 4. Page Title and Icon

-   **Browser Tab Title**: Export a `metadata` object from your page file.
    ```tsx
    // app/my-new-page/page.tsx
    import type { Metadata } from 'next';
    import { projectConfig } from '@/config/project.config';

    export const metadata: Metadata = {
      title: `My New Page | ${projectConfig.appName}`,
    };
    // ... rest of page component
    ```
-   **Displayed Page Title**: Use the `PageTitleWithIcon` component (see Step 1 example).
-   **Page Icon (Next to Title)**:
    *   `PageTitleWithIcon` uses the global app icon from `projectConfig.appIconPaths`.
    *   If no global icon is set, it uses a generic `FileText` icon.
-   **Global App Icon (Header & Favicon)**:
    *   **In-App Icon**: Modify `appIconPaths` in `config/project.config.ts`.
    *   **Browser Tab Icon (Favicon)**: Replace or update `public/favicon.svg`.

### 5. Use Theme Settings

-   Import `useTheme` from `contexts/theme-provider.tsx` to access `accentColor`, `borderRadius`, etc.
```tsx
// app/my-new-page/page.tsx (inside your component)
import { useTheme } from '@/contexts/theme-provider';
import { Button } from '@/components/ui/button';

const { accentColor, borderRadius } = useTheme();
// ...
<p style={{ color: `hsl(${accentColor})` }}>Styled text.</p>
<Button style={{ borderRadius: borderRadius }}>Styled Button</Button>
```

### 6. Version-Specific Content

-   Use `appVersion` from `useTheme` to show different content.
```tsx
// app/my-new-page/page.tsx
import { useTheme } from '@/contexts/theme-provider';
const { appVersion } = useTheme();
// ...
{appVersion === 'v1.0.0' && <p>Content for Version 1.0.</p>}
{appVersion === 'beta' && <p>Content for Beta.</p>}
```

### 7. Add "Appearance" Dropdowns (Theme Switcher Style)

-   To replicate Theme Switcher dropdowns (mode, accent, radius, version):
    *   Use the `useTheme` hook for current values and setters.
    *   Adapt JSX from `components/layout/theme-switcher.tsx` or create a new component.
    *   Use `projectConfig.availableAccentColors`, etc., for dropdown options.

### 8. Create a New Application Version

1.  **Define in `config/project.config.ts`**:
    *   Add a new object to `availableAppVersions` (e.g., `{ name: 'Version 2.0', id: 'v2.0.0' }`).
    ```typescript
    // config/project.config.ts
    export const projectConfig: ProjectConfig = {
      // ...
      availableAppVersions: [
        { name: 'Version 1.0', id: 'v1.0.0' },
        { name: 'New Version Alpha', id: 'v2.0.0-alpha' }, // New version
      ],
      // ...
    };
    ```
2.  **Implement Logic**: Use `appVersion` from `useTheme` to control UI/features for the new version ID.

The new version will then appear in version switchers.
