# Development Guidelines

## Code Quality Standards

### File Organization and Structure
- **Modular Architecture**: The codebase follows a clear separation between frontend (React) and backend (Electron) components
- **Directory Structure**: Well-organized with dedicated folders for components (`src/Components/`), authentication (`src/Auth/`), assets (`src/assets/`), and Electron processes (`electron/`)
- **Configuration Files**: Centralized configuration with `vite.config.js` for build settings and `package.json` for dependencies

### JavaScript/JSX Conventions
- **ES6+ Syntax**: Consistent use of modern JavaScript features including:
  - Import/export statements (`import { createClient } from '@supabase/supabase-js'`)
  - Arrow functions and destructuring
  - Template literals for string interpolation
- **React Patterns**: 
  - Functional components with hooks
  - Strict mode implementation (`<React.StrictMode>`)
  - Component-based architecture with clear separation of concerns

### Code Formatting Standards
- **Consistent Indentation**: 2-space indentation throughout the codebase
- **Line Endings**: CRLF line endings (Windows-style `\r\n`)
- **Import Organization**: Clean import statements with proper grouping
- **Semicolon Usage**: Consistent semicolon usage in JavaScript files

## Architectural Patterns

### Electron Application Structure
- **Main Process**: Centralized in `electron/main.cjs` for application lifecycle management
- **Preload Scripts**: Secure IPC communication through `electron/preload.js` using `contextBridge`
- **Database Integration**: Local database operations exposed through IPC channels

### React Application Patterns
- **Component Hierarchy**: Clear parent-child relationships with `App.jsx` as the root component
- **Entry Point**: Standard React 18 pattern with `createRoot` API
- **Asset Management**: Base64 encoded assets for Electron compatibility

### Database and Authentication
- **Supabase Integration**: External database service with proper client configuration
- **Local Database**: SQLite integration through Electron's main process
- **IPC Communication**: Secure data flow between renderer and main processes

## Development Standards

### Build and Configuration
- **Vite Build System**: Modern build tool with optimized configuration for Electron
- **Relative Paths**: Base path set to `'./'` for proper Electron asset loading
- **Output Directory**: Standardized `dist` folder for built assets
- **JSX Processing**: Automatic JSX transformation with esbuild

### Security Practices
- **Context Isolation**: Proper use of `contextBridge` for secure IPC
- **API Key Management**: External service credentials properly configured
- **Process Separation**: Clear separation between main and renderer processes

### Data Management Patterns
- **CRUD Operations**: Standardized database operations (upsert, get, search, filter, delete)
- **Async/Await**: Consistent use of modern async patterns with `ipcRenderer.invoke`
- **Data Synchronization**: Built-in sync mechanisms with timestamp tracking

## Common Implementation Patterns

### IPC Communication Pattern
```javascript
// Preload script pattern
contextBridge.exposeInMainWorld('localDb', {
  operationName: (params) => ipcRenderer.invoke('db:operationName', params)
})
```

### React Component Pattern
```javascript
// Standard functional component with hooks
import React from 'react'
import ComponentName from './path/to/Component.jsx'

// Component implementation with proper imports and exports
```

### Configuration Pattern
```javascript
// Centralized configuration with clear exports
export default defineConfig({
  // Configuration options with comments
})
```

## Quality Assurance

### File Naming Conventions
- **React Components**: PascalCase with `.jsx` extension
- **JavaScript Modules**: camelCase with `.js` extension
- **Configuration Files**: Descriptive names with appropriate extensions
- **Asset Files**: Descriptive names with format indicators (e.g., `logo_b64.js`)

### Code Documentation
- **Inline Comments**: Descriptive comments for complex logic and configuration
- **Function Documentation**: Clear parameter and return value descriptions
- **Configuration Comments**: Explanatory comments for build and setup configurations

### Error Handling and Validation
- **Async Operations**: Proper promise handling with invoke patterns
- **Type Safety**: Consistent parameter passing and validation
- **Resource Management**: Proper cleanup and resource disposal patterns

## Technology-Specific Guidelines

### Electron Development
- **Security**: Always use preload scripts for IPC communication
- **Performance**: Minimize main process blocking operations
- **Platform Compatibility**: Consider cross-platform file path handling

### React Development
- **Hooks Usage**: Prefer functional components with hooks over class components
- **State Management**: Local state management with potential for global state solutions
- **Component Reusability**: Modular component design for maintainability

### Database Operations
- **Consistency**: Standardized CRUD operation naming and implementation
- **Performance**: Efficient query patterns and data synchronization
- **Backup**: Built-in backup and recovery mechanisms

This codebase demonstrates a well-structured Electron-React application with clear separation of concerns, modern JavaScript practices, and secure IPC communication patterns.