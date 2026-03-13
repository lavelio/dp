# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
This is an Office Web Add-in (specifically for Microsoft Outlook) called "Digitales Postfach" - an AI-powered email response generator. Built with React 18, TypeScript, and Office.js API.

## Development Commands

### Build & Development
- `npm run build` - Production build (outputs to `/dist`)
- `npm run build:dev` - Development build
- `npm run dev-server` - Start development server with hot reloading on port 3000
- `npm run watch` - Development build with file watching

### Office Add-in Development
- `npm start` - Start Office Add-in debugging with manifest.xml
- `npm run start:desktop` - Start for desktop Outlook
- `npm run start:web` - Start for web Outlook
- `npm run stop` - Stop Office Add-in debugging
- `npm run validate` - Validate the Office Add-in manifest

### Code Quality
- `npm run lint` - Run ESLint checks
- `npm run lint:fix` - Auto-fix ESLint issues
- `npm run prettier` - Format code with Prettier

### Authentication
- `npm run signin` - Sign in to M365 account for development
- `npm run signout` - Sign out of M365 account

## Architecture & Structure

### Entry Points
The application has three main entry points defined in webpack:
1. **Taskpane** (`/src/taskpane/`) - Main add-in interface with tabbed navigation
2. **Answer Form** (`/src/answer_form/`) - Dedicated AI response generation form
3. **Commands** (`/src/commands/`) - Office command handlers

### Key Components
- `App.tsx` - Root component with 370px max width constraint
- `TabPanes.tsx` - Main navigation structure
- `TabAnswer.tsx` - AI response generation interface
- `TabSettings.tsx` - User settings management
- `TabActivity.tsx` - Activity tracking
- `TaskForm.tsx` - Task input forms
- `DialogForm.tsx` - Modal dialogs

### UI Framework
Uses Microsoft Fluent UI (`@fluentui/react-components`) as the primary UI framework with additional Lucide React icons.

### Build Configuration
- **Development**: Uses `https://localhost:3000/` with hot reloading
- **Production**: Deploys to `https://lavelio.github.io/dp/`
- **Webpack**: Custom configuration with code splitting for vendors and Fluent UI
- **TypeScript**: Compiles to ES5 for Office.js compatibility

## Development Workflow

### Local Development (with Parallels/Windows)
1. Use `dev-manifest.xml` which points to localhost:3001
2. Run `npm run dev-server` (starts on port configured in package.json: 3001)
3. Clear Office cache in Windows: `rmdir /s /q "%LOCALAPPDATA%\Microsoft\Office\16.0\Wef\"`
4. Sideload using `npx office-addin-debugging start dev-manifest.xml`

### Production Deployment
1. Run `npm run build` - creates optimized files in `/dist`
2. Upload `/dist` contents to production server
3. Manifest URLs are automatically transformed from localhost to production URLs

### Troubleshooting Cache Issues
- Clear Office cache completely
- Restart Outlook
- Check browser developer tools for console errors
- Verify local server is running on correct port

## Configuration Notes
- Minimum Mailbox API version: 1.3
- Default locale: de-DE (German)
- Add-in has `ReadWriteItem` permission
- Connects to two external domains: `lavelio.github.io` and `fg.server.lavel.io`
- Port configuration: Development server port is configurable via `package.json` config section (currently 3001)

## File Structure
- `/assets/` - Icons and static resources
- `/src/taskpane/` - Main add-in UI components
- `/src/answer_form/` - Standalone answer generation interface
- `/src/commands/` - Office command integration
- `manifest.xml` - Production manifest
- `dev-manifest.xml` - Development manifest (points to localhost)
- `PROJECT_DOCUMENTATION.md` - Detailed project documentation