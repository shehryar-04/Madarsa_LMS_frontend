# Project Structure

## Directory Organization

### Root Level Structure
```
my-electron-app/
├── electron/          # Electron main process files
├── src/              # React frontend source code
├── public/           # Static assets and fonts
├── scripts/          # Build and utility scripts
├── release/          # Built application packages
└── system/           # System-related files
```

### Core Application Components

#### `/electron/` - Desktop Application Layer
- **main.cjs**: Main Electron process, window management, and app lifecycle
- **preload.js**: Secure bridge between main and renderer processes
- **db.cjs**: Local database operations and data persistence

#### `/src/` - React Frontend Application
```
src/
├── Components/       # Feature-based React components
│   ├── students/    # Student management UI
│   ├── classes/     # Class and academic management
│   ├── rooms/       # Room allocation system
│   ├── sanad/       # Certificate/diploma management
│   ├── audit/       # System audit and logging
│   ├── shared/      # Reusable UI components
│   └── layout/      # Application layout components
├── Auth/            # Authentication system
├── hooks/           # Custom React hooks for data management
├── constants/       # Application constants and configurations
└── assets/          # Images, icons, and static resources
```

#### `/public/` - Static Resources
- **fonts/**: Arabic and Urdu font files (Amiri family)
- **favicon.svg**: Application icon
- **icons.svg**: UI icon sprites

## Architectural Patterns

### Component Architecture
- **Feature-based organization**: Components grouped by functional domain (students, classes, etc.)
- **Shared component library**: Reusable UI elements in `/shared/`
- **Layout separation**: Distinct layout components (Sidebar, Topbar)

### Data Management Pattern
- **Custom hooks pattern**: Business logic encapsulated in custom hooks
- **Supabase integration**: Cloud database with local caching
- **Local backup system**: Offline data persistence and recovery

### Authentication Flow
- **Context-based auth**: AuthContext for global authentication state
- **Supabase Auth**: External authentication provider integration
- **Protected routes**: Component-level access control

## Core Component Relationships

### Student Management Flow
```
StudentDashboard → StudentTable → StudentModal → StudentFormFields
                ↓
            useStudentData → SupabaseClient
```

### Report Generation Flow
```
ReportModal → usePdfReport → jsPDF/html2pdf
           ↓
       StudentFormPrint
```

### Audit System Flow
```
AuditDashboard → useAuditLogs → Local Database
              ↓
          AuditLogModal
```

## Build and Distribution Structure

### Development Environment
- **Vite**: Frontend build tool and dev server
- **Electron**: Desktop application framework
- **Concurrently**: Parallel process management

### Production Build
- **electron-builder**: Application packaging and distribution
- **Windows-specific**: Portable executable generation
- **Multi-language support**: Localization files and font embedding

## Key Architectural Decisions

1. **Hybrid Architecture**: Electron + React for desktop-first experience with web technologies
2. **Offline-first Design**: Local database with cloud synchronization
3. **Islamic Localization**: Built-in Arabic/Urdu support with appropriate fonts
4. **Modular Component Design**: Feature-based organization for maintainability
5. **Hook-based State Management**: Custom hooks for business logic separation