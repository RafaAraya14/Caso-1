# 20minCoach - Frontend Architecture Design

## Course Information
- **Course**: Diseño de Software GR 2
- **Professor**: Rodrigo Nuñez Nuñez
- **Team Members**: 
  - Lee-Sang-cheol 2024081079
  - [Member 2 Name]  
  - [Member 3 Name]

## Project Description
20minCoach is a real-time coaching platform that connects users with experts across multiple fields through on-demand 20-minute video sessions. This repository contains the frontend architecture design and implementation for the platform.

## Case Resolution Tasks

### Core Tasks to Perform

#### 1. Proof of Concepts (PoCs)
- [ ] **Frontend Source Code Structure**
  - Complete project structure in `/src` folder
  - All PoC source code and requested classes
  - Templates and guidance files in correct layer folders

- [ ] **Testing Strategy**
  - Design testing strategy focusing on unit testing
  - Implement three unit tests for two different classes
  - Add testing scripts with pass/fail proof
  - Instructions for adding and running new unit tests

- [ ] **UX & Security**
  - Generate AI prototype screen for coach search and results
  - Conduct UX testing with 3-5 participants
  - Implement authentication and authorization with roles (BasicUser, PremiumUser)
  - Enable Two-Factor Authentication
  - Integrate login screen with role-based permissions

### Design Document Requirements

#### 2. Technology Research and Selection
- [ ] Research and compare modern frontend frameworks (React, Vue, Angular, etc.)
- [ ] Evaluate state management solutions (Redux, MobX, etc.)
- [ ] Research real-time communication technologies (WebSockets, WebRTC)
- [ ] Select testing frameworks and tools
- [ ] Choose styling methodologies and tools
- [ ] Select linter and unit test technology

#### 3. N-Layer Architecture Design
- [ ] Design layered architecture for frontend application
- [ ] Define responsibilities for each layer
- [ ] Establish communication patterns between layers
- [ ] Ensure separation of concerns and maintainability

#### 4. Visual Components Strategy
- [ ] Develop component organization strategy
- [ ] Design reusable component library structure
- [ ] Create component development workflow
- [ ] Establish component testing methodology

### Detailed Layer Design Requirements

The following layers must be implemented in the frontend architecture:

- [ ] **Visual Components** - Component hierarchy and reusable UI components
- [ ] **Controllers** - Business logic mediation and user input validation
- [ ] **Model** - Model classes with validation
- [x] **Middleware** - Request/response interceptors, permissions, error handling, logging *(See section below)*
- [ ] **Business** - Domain-driven design and business logic services
- [ ] **Proxy/Client/Services** - API client abstraction layer
- [ ] **Background/Jobs/Listeners** - Real-time updates and data refresh
- [ ] **Validators** - Input and data validation
- [ ] **DTOs** - Data Transfer Objects for API communication
- [ ] **State Management** - State management solution implementation
- [ ] **Styles** - CSS management and responsive design
- [ ] **Utilities** - Utility functions and helpers
- [ ] **Exception Handling** - Standardized exception handling
- [ ] **Logging** - Structured logging system
- [ ] **Security** - Authentication and authorization layers
- [ ] **Linter Configuration** - Code style rules and conventions
- [ ] **Build and Deployment Pipeline** - Build process for different environments

## Current Implementation Status

### ✅ Middleware Layer

The middleware layer has been designed and documented to handle cross-cutting concerns in the application. This layer provides:

1. **Request/Response Interceptors** - Automatic token attachment and header management
2. **Permissions Validation** - Role-based access control for protected routes
3. **Error Handling** - Centralized exception management with user-friendly messages
4. **Logging Events** - Strategy pattern implementation for flexible logging providers


### Project Structure
```
20minCoach/
├── README.md
├── docs/
│   └── middleware.md
├── src/
│   ├── middleware/
│   │   ├── interceptors.js
│   │   ├── permissionsMiddleware.js
│   │   ├── errorHandler.js
│   │   └── loggingMiddleware.js
│   └── [other layers to be implemented]
└── diagrams/
    └── [architecture diagrams]
```

## Deliverables

### Repository Requirements
- GitHub/GitLab repository with proper structure
- Comprehensive documentation in README.md
- Architecture diagrams in `/diagrams` folder
- Complete project structure in `/src` folder
- All proof of concepts implemented

### Documentation Requirements
- All sections from project brief documented
- Clear explanations and justifications
- Diagrams and visual aids
- Code snippets and examples

### Architecture Diagrams
- N-Layer architecture diagram
- Object design with design patterns
- Class responsibilities and interactions
- Full architecture diagram in PDF format

## Important Dates
- **Questions Deadline**: Monday, September 22nd
- **Final Commit**: Saturday, September 27th

---

*Note: Commits will be reviewed to validate participation from all team members throughout the 3-week work period. Penalties may apply for insufficient participation.*
