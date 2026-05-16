# Technology Stack

## Programming Languages and Versions

### Primary Languages
- **JavaScript (ES6+)**: Main application language with modern syntax
- **JSX**: React component markup
- **CSS3**: Styling with modern features and Arabic/RTL support
- **HTML5**: Semantic markup structure

### Runtime Environments
- **Node.js**: Backend runtime for Electron main process
- **Electron v41.1.1**: Desktop application framework
- **React v19.2.4**: Frontend UI library with latest features

## Core Dependencies

### Frontend Framework
```json
"react": "^19.2.4"
"react-dom": "^19.2.4"
```

### Desktop Application
```json
"electron": "^41.1.1"
"electron-builder": "^25.1.8"
"electron-rebuild": "^3.2.9"
```

### Database and Authentication
```json
"@supabase/supabase-js": "^2.101.1"
```

### PDF Generation and Reporting
```json
"jspdf": "^4.2.1"
"jspdf-autotable": "^5.0.7"
"html2pdf.js": "^0.14.0"
```

## Build System and Development Tools

### Build Tools
- **Vite v8.0.1**: Fast frontend build tool with HMR
- **electron-builder**: Application packaging and distribution
- **concurrently**: Parallel script execution for development

### Development Scripts
```bash
npm run dev          # Start Vite development server
npm run electron     # Launch Electron application
npm run start        # Concurrent dev server + Electron
npm run build        # Production build
npm run dist         # Build and package for distribution
```

### Development Workflow
1. **Hot Module Replacement**: Instant updates during development
2. **Concurrent Development**: Frontend and Electron processes run simultaneously
3. **Wait-on Integration**: Automatic Electron launch after dev server ready

## Application Configuration

### Electron Builder Configuration
```json
{
  "appId": "com.madarsa.lms",
  "productName": "دارالعلوم اسلامیہ",
  "directories": { "output": "release" },
  "win": {
    "target": [{ "target": "portable", "arch": ["x64"] }],
    "signingHashAlgorithms": null
  }
}
```

### Vite Configuration
- **ES Module Support**: Modern JavaScript module system
- **React Plugin Integration**: Optimized React development experience
- **Asset Handling**: Automatic optimization for fonts and images

## Database and Storage

### Primary Database
- **Supabase**: PostgreSQL-based cloud database
- **Real-time subscriptions**: Live data updates
- **Authentication integration**: Built-in user management

### Local Storage
- **Electron Store**: Local configuration and cache
- **File System Access**: Direct file operations for backups
- **SQLite Integration**: Local database for offline functionality

## Internationalization and Fonts

### Font Support
- **Amiri Font Family**: Arabic text rendering
  - Amiri-Regular.ttf
  - Amiri-Bold.ttf
- **Google Fonts Integration**:
  - Noto Naskh Arabic (Arabic script)
  - Noto Nastaliq Urdu (Urdu script)
  - Inter (Latin script)

### Language Support
- **RTL Layout**: Right-to-left text direction support
- **Unicode Handling**: Full Arabic and Urdu character support
- **Multi-script Typography**: Mixed language text rendering

## Development Environment Requirements

### System Requirements
- **Node.js**: v16+ recommended
- **npm**: v8+ for package management
- **Windows**: Primary target platform (x64)
- **Git**: Version control system

### IDE and Tooling
- **ES6+ Support**: Modern JavaScript features
- **JSX Syntax Highlighting**: React component development
- **CSS Modules**: Scoped styling support
- **Electron DevTools**: Desktop application debugging

## Security and Performance

### Security Features
- **Context Isolation**: Secure Electron renderer process
- **Preload Scripts**: Safe IPC communication
- **CSP Headers**: Content Security Policy implementation
- **No Node Integration**: Renderer process security

### Performance Optimizations
- **Code Splitting**: Lazy loading for large components
- **Asset Optimization**: Automatic image and font compression
- **Tree Shaking**: Dead code elimination
- **Production Minification**: Optimized bundle sizes