
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
    *   A file named `.env` has been provided in the root of your project with placeholder values.
    *   You should copy this file to `.env.local`. `.env.local` is ignored by Git.
        ```bash
        cp .env .env.local
        ```
    *   Open your `.env.local` file.
    *   You should populate `NEXT_PUBLIC_API_BASE_URL` if you intend to connect to a real backend later. For now, it can point to a mock server or be a placeholder. Example:
        ```env
        NEXT_PUBLIC_API_BASE_URL="http://localhost:3001/api"
        ```
    *   Firebase configuration variables are no longer required as Firebase has been removed. The application uses a dummy authentication system and mock API services.

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
-   **Config Advisor**: AI-powered tool to analyze configuration files (`project.config.ts`, `sidebar.config.ts`, `roles.config.ts`) for improvements. Accessible to (mock) admins.

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

For future development, the functions in `src/services/api.ts` can be updated to make real HTTP requests to your backend using the `NEXT_PUBLIC_API_BASE_URL` environment variable.
