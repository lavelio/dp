# Digitales Postfach - Outlook Add-in Documentation

## Project Overview
Digitales Postfach is an Office Web Add-in specifically designed for Microsoft Outlook. Its primary purpose is to assist users in generating AI-powered responses within Outlook. The add-in is built using React with TypeScript and follows modern web development practices.

## Project Structure

### Root Directory
- `/src` - Main source code directory
- `/dist` - Compiled and bundled files
- `/assets` - Static assets like images and icons
- `manifest.xml` - Office Add-in configuration file
- `webpack.config.js` - Build configuration
- `package.json` - Project dependencies and scripts

### Source Code Organization (`/src`)

#### 1. Taskpane Components (`/src/taskpane/components`)
The main UI components of the add-in:
- `App.tsx` - Root component
- `TabPanes.tsx` - Main tab navigation structure
- `TabAnswer.tsx` - AI response generation interface
- `TabSettings.tsx` - User settings management
- `TabActivities.tsx` - Activity tracking
- `TaskForm.tsx` - Task input form
- `DialogForm.tsx` - Modal dialog component
- `TaskTemplateSelector.tsx` - Template selection interface

#### 2. Answer Form (`/src/answer_form`)
Dedicated components for handling answer generation and formatting.

#### 3. Commands (`/src/commands`)
Command-related functionality for Outlook integration.

## Technical Stack

### Core Technologies
- React 18
- TypeScript
- Office.js API
- Fluent UI React Components

### Key Dependencies
- `@fluentui/react-components` - Microsoft's Fluent UI framework
- `@fluentui/react-icons` - Icon set
- `html-react-parser` - HTML parsing utilities
- `lucide-react` - Additional icon set

## Development Setup

### Development Scripts
- `npm start` - Start the development server
- `npm run build` - Production build
- `npm run dev-server` - Development server with hot reloading
- `npm run validate` - Validate the Office Add-in manifest

### Configuration
- Development server runs on port 3000
- Supports both desktop and web versions of Outlook
- Requires minimum Mailbox API version 1.14

## Add-in Features

### Permissions
- Has `ReadWriteItem` permission to interact with email items

### Functionality
1. AI-Powered Response Generation
   - Generates contextual responses to emails
   - Supports templates and customization

2. Settings Management
   - User preferences configuration
   - Template management

3. Activity Tracking
   - Monitors and logs user interactions
   - Provides activity history

### Integration Points
- Integrates with external AI services via API endpoints
- Connects to two domains:
  - Primary VPS domain
  - Server at fg.server.lavel.io

## Deployment
The add-in is deployed to a VPS with the following assets:
- Main application at `/digitales-postfach/taskpane.html`
- Assets hosted at `/digitales-postfach/assets/`
- Help documentation at `/digitales-postfach/help.html`

## Version Information
Current version: 3.1.109.0
Default locale: de-DE (German)

## Development vs. Production Workflow

### Development Environment
When developing and testing locally with Parallels, use the following workflow:

1. **Development Manifest**
   - Use `dev-manifest.xml` which points to `https://localhost:3001/`
   - This allows testing changes locally before deploying to production

2. **Local Development Server**
   - Run the development server: `npm run dev-server`
   - This starts a local server at port 3001 (configured in package.json)

3. **Sideloading in Outlook (Parallels)**
   - In Windows (Parallels), clear the Office Add-in cache:
     ```
     rmdir /s /q "%LOCALAPPDATA%\Microsoft\Office\16.0\Wef\"
     ```
   - Sideload the add-in using the dev-manifest.xml:
     ```
     npx office-addin-debugging start dev-manifest.xml
     ```
   - Alternatively, manually sideload the add-in in Outlook by selecting the dev-manifest.xml file

4. **Troubleshooting Cache Issues**
   - If changes aren't appearing, clear the Office cache
   - Restart Outlook completely
   - Verify the local server is running
   - Check browser developer tools for any console errors

### Production Deployment
When ready to deploy to production:

1. **Build for Production**
   - Run: `npm run build`
   - This creates optimized files in the `/dist` directory
   - The manifest is automatically transformed to use production URLs

2. **Deployment**
   - Upload the contents of `/dist` to the production server
   - No changes needed for existing users - they'll get the new version automatically

3. **Version Management**
   - Update version number in `manifest.xml` for major releases
   - Document changes in release notes
