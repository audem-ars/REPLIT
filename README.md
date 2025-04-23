# Replit Clone

A simplified Replit clone with code editing, execution, and basic project management capabilities.

## Features

- 📁 File explorer with file/folder creation
- 🖥️ Code editor with syntax highlighting (Monaco editor)
- 💻 Terminal for command execution
- 📊 Project creation and management
- 🔄 Resizable panels (sidebar and terminal)

## Setup Instructions

### Prerequisites

- Node.js v16+ and npm
- PostgreSQL database

### Installation

1. Clone the repository:
```bash
git clone <your-repository-url>
cd replit-clone
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory with the following content:
```
DATABASE_URL=postgresql://username:password@hostname:port/database
```

4. Run the application:
```bash
npm run dev
```

The application will be available at http://localhost:5000.

## Project Structure

- `/client`: Frontend React application
  - `/src/components`: UI components
  - `/src/hooks`: Custom React hooks
  - `/src/lib`: Utility functions
  - `/src/pages`: Application pages
- `/server`: Backend Express server
  - `/routes.ts`: API endpoints
  - `/storage.ts`: Data storage layer
- `/shared`: Shared code between client and server
  - `/schema.ts`: Database schema and types

## Technologies Used

- Frontend: React, TypeScript, Tailwind CSS, shadcn/ui
- Backend: Express, Node.js
- Database: PostgreSQL with Drizzle ORM
- Editor: Monaco Editor (same as VS Code)