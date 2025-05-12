
# Genesis Template

This is a Next.js starter template, "Genesis Template", designed for rapid development, now using a mock API service layer for backend interactions.

## Getting Started

To get started with the Genesis Template:

1.  **Clone the repository** (if you haven't already).
2.  **Install dependencies**:
    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    ```
3.  **Set up Environment Variables**:
    *   A file named `.env` has been provided in the root of your project.
    *   You should copy this file to `.env.local`. `.env.local` is ignored by Git and is where your local environment-specific variables should go.
        ```bash
        cp .env .env.local
        ```
    *   Open your `.env.local` file.
    *   The primary variable to configure is `NEXT_PUBLIC_API_BASE_URL`.
        *   Initially, this can be a placeholder or point to a local mock server if you set one up separately. The application uses an internal mock API service by default (see "Mock API and Data" section below).
        *   When you're ready to connect to your actual backend, update this URL to point to your API's base endpoint.
        Example:
        ```env
        NEXT_PUBLIC_API_BASE_URL="http://localhost:3001/api"
        # Or for a production API:
        # NEXT_PUBLIC_API_BASE_URL="https://api.yourdomain.com"
        ```
    *   No Firebase configuration is required as Firebase has been removed.

4.  **Restart your development server**:
    If your Next.js development server was already running, you **must restart it** for any new environment variables in `.env.local` to be loaded.
    ```bash
    # Stop the server (Ctrl+C or Cmd+C) if running, then:
    npm run dev
    # or
    yarn dev
    # or
    pnpm dev
    ```
    The application should now be running, typically on `http://localhost:9002`.

5.  **Explore the App**:
    *   Navigate to `src/app/page.tsx` to see the entry point.
    *   The application uses a dummy authentication system. Default credentials are:
        *   Admin: `admin@dummy.com` / `password123`
        *   User: `user@dummy.com` / `password123`
    *   You can register new dummy users, and their data will be stored in your browser's local storage for the session.
    *   Check out core features like Theme Switcher, Profile Editor, Role-Based Access Control (mocked), Dynamic Sidebar, and the AI Config Advisor.

## Core Features

-   **Theme Switcher**: Dynamic theme customization (dark/light modes, accent color, border radius). Access via the palette icon in the header.
-   **Profile Editor**: User profile management (personal details, password change) using mock services.
-   **Access Control**: Role-based access control for routes (mocked), configured in `src/config/roles.config.ts`.
-   **Sidebar Manager**: Dynamic sidebar navigation, configured in `src/config/sidebar.config.ts`, with a minimize option.
-   **Config Advisor**: AI-powered tool to analyze configuration files (`project.config.ts`, `sidebar.config.ts`, `roles.config.ts`) for improvements. Accessible to (mock) admins. This feature can be enabled or disabled (see "Toggling Config Advisor" section below).

## Genkit for AI Features

This application uses Genkit for AI-related functionalities like the Config Advisor.
-   Genkit flows are typically located in `src/ai/flows/`.
-   To run Genkit services locally for development (e.g., if you extend AI features):
    ```bash
    npm run genkit:dev
    # or for watching changes
    npm run genkit:watch
    ```

## Mock API and Data

The application currently uses a mock API service layer located in `src/services/api.ts`. This layer simulates backend interactions and uses dummy data primarily from `src/data/dummy-data.ts`. This allows for full frontend development and testing without a live backend. User authentication is also handled by a dummy system, with user data persisted in local storage.

### Data Persistence (Mock Setup)

In the current mock setup, data is persisted in the browser's Local Storage:
-   **User Session**: `AuthProvider` stores the current logged-in (dummy) user in `localStorage` (key: `genesis_current_dummy_user`). MFA verification status is also stored (key: `genesis_mfa_verified`).
-   **Dummy User Database**: A list of all registered dummy users is stored in `localStorage` (key: `genesis_dummy_users`). This is managed by `src/services/api.ts` and used by the User Management features.
-   **Theme Settings**: `ThemeProvider` stores theme preferences (mode, accent color, border radius, app version, app name) in `localStorage` (key prefix: `genesis-theme-`).
-   **Config Advisor Inputs**: The `ConfigAdvisorPage` stores user inputs for the AI configuration analysis in `localStorage` (key: `configAdvisorInputs`).

**Note**: This Local Storage persistence is for the mock/dummy setup. When you integrate a real backend API, this data would typically be stored in your backend database, and Local Storage would primarily be used for session tokens or minimal client-side preferences.

## Connecting to Your Backend API

To connect the Genesis Template to your actual backend API, follow these steps:

1.  **Set `NEXT_PUBLIC_API_BASE_URL`**:
    *   In your `.env.local` file, update `NEXT_PUBLIC_API_BASE_URL` to point to your backend's base URL. For example:
        ```env
        NEXT_PUBLIC_API_BASE_URL="https://your-api.example.com/v1"
        ```
    *   Restart your Next.js development server for this change to take effect.

2.  **Update API Service Functions**:
    *   Open `src/services/api.ts`. This file contains functions like `fetchUsers`, `addUser`, `updateUserProfile`, etc. Currently, these functions return mock data or simulate API calls.
    *   Modify these functions to make actual HTTP requests to your backend endpoints using an HTTP client like `axios` (which is already set up in `apiClient` within this file) or `fetch`.
    *   **Example - Modifying `fetchUsers`**:
        ```typescript
        // Before (Mock Implementation) in src/services/api.ts
        // export const fetchUsers = async (): Promise<UserProfile[]> => {
        //   console.log('API Service: Mock fetchUsers called');
        //   return Promise.resolve([...currentMockUsers]);
        // };

        // After (Real API Call) in src/services/api.ts
        import type { UserProfile } from '@/types'; // Ensure UserProfile type matches your API response
        // ... (apiClient setup remains the same)

        export const fetchUsers = async (): Promise<UserProfile[]> => {
          try {
            const response = await apiClient.get('/users'); // Replace '/users' with your actual endpoint
            return response.data; // Assuming your API returns user data in response.data
          } catch (error) {
            console.error('Error fetching users:', error);
            // Handle errors appropriately, e.g., throw error or return empty array
            throw error;
          }
        };
        ```
    *   Update all relevant functions in `src/services/api.ts` (`addUser`, `updateUser`, `deleteUser`, `loginUser`, `registerUser`, `updateUserProfile`, `changeUserPassword`, etc.) to interact with your backend endpoints. Ensure the request payloads and response data structures match your API's specifications.

3.  **Authentication**:
    *   The current application uses a dummy authentication system managed by `src/contexts/auth-provider.tsx` and `src/services/api.ts` (mock `loginUser`, `registerUser`).
    *   You will need to replace this with your backend's authentication mechanism.
    *   Modify `loginUser` and `registerUser` in `src/services/api.ts` to call your backend's auth endpoints.
    *   Adjust `src/contexts/auth-provider.tsx` to handle tokens (e.g., JWTs) received from your backend, store them securely (e.g., HttpOnly cookies managed by the backend, or localStorage for client-side tokens), and include them in `apiClient` requests (e.g., via Authorization headers).
    *   The `apiClient` in `src/services/api.ts` can be configured with interceptors to automatically add auth tokens to requests.

4.  **Data Types**:
    *   Ensure the TypeScript types defined in `src/types/index.ts` (e.g., `UserProfile`) match the data structures your backend API expects and returns. Update these types as necessary.

By following these steps, you can transition the Genesis Template from using its mock API to interacting with your live backend services.

## Toggling Config Advisor Feature

The AI-powered Config Advisor feature can be enabled or disabled globally via a configuration setting.

-   **Location**: `src/config/project.config.ts`
-   **Property**: `enableConfigAdvisor` (boolean)

To **disable** the Config Advisor:
1.  Open `src/config/project.config.ts`.
2.  Find the `enableConfigAdvisor` property within the `projectConfig` object.
3.  Set its value to `false`:
    ```typescript
    export const projectConfig: ProjectConfig = {
      // ... other properties
      enableConfigAdvisor: false, // Set to false to disable
    };
    ```

To **enable** the Config Advisor:
1.  Open `src/config/project.config.ts`.
2.  Set `enableConfigAdvisor` to `true`:
    ```typescript
    export const projectConfig: ProjectConfig = {
      // ... other properties
      enableConfigAdvisor: true, // Set to true to enable
    };
    ```
When disabled:
-   The "Config Advisor" link will be removed from the sidebar.
-   The "Config Advisor" card will be hidden from the admin dashboard.
-   Direct navigation to the `/config-advisor` page will show a "Feature Disabled" message.

Restart your development server if it was running for the changes in `project.config.ts` to be fully reflected, especially for server-side logic or build-time configurations (though in this case, it's primarily client-side rendering that will be affected).
