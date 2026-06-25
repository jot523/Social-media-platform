# 🏗️ CONNECTO - MVC + MVVM Hybrid Architecture

## 📋 Architecture Overview

CONNECTO implements a **hybrid MVC + MVVM architecture** that combines the best of both patterns:

- **MVC (Model-View-Controller)** for backend API structure
- **MVVM (Model-View-ViewModel)** for frontend React components
- **Clean separation of concerns** across all layers
- **CSS Modules** for scoped styling

---

## 🎯 Architecture Principles

### **1. Separation of Concerns**
- **Models**: Data structures, validation, and API integration
- **Views**: Pure presentation components (UI only)
- **ViewModels**: Component logic, state management, and data binding
- **Controllers**: Route handling and business logic coordination
- **Services**: Reusable business logic and external integrations

### **2. Data Flow Pattern**
```
User Interaction → View → ViewModel → Model → API → Controller → Response
```

### **3. State Management Strategy**
- **Global State**: Redux Toolkit for app-wide state (auth, posts, users)
- **Local State**: ViewModels for component-specific state
- **Server State**: React Query for API data caching and synchronization

---

## 📂 Frontend Structure (MVVM Pattern)

```
src/
├── 📁 models/                    # Data Models & API Integration
│   ├── entities/                 # Data entity definitions
│   │   ├── User.model.js
│   │   ├── Post.model.js
│   │   ├── Story.model.js
│   │   ├── Reel.model.js
│   │   └── Message.model.js
│   ├── api/                      # API service layer
│   │   ├── auth.api.js
│   │   ├── posts.api.js
│   │   ├── users.api.js
│   │   ├── messages.api.js
│   │   └── base.api.js
│   └── validators/               # Data validation
│       ├── user.validator.js
│       └── post.validator.js
│
├── 📁 viewmodels/               # Component Logic & State
│   ├── auth/
│   │   ├── useAuthViewModel.js
│   │   └── useLoginViewModel.js
│   ├── feed/
│   │   ├── useHomeViewModel.js
│   │   ├── usePostViewModel.js
│   │   └── useStoriesViewModel.js
│   ├── profile/
│   │   └── useProfileViewModel.js
│   ├── chat/
│   │   └── useChatViewModel.js
│   └── shared/
│       ├── useNotificationViewModel.js
│       └── useSearchViewModel.js
│
├── 📁 views/                    # Pure Presentation Components
│   ├── pages/                   # Page-level components
│   │   ├── HomePage/
│   │   │   ├── HomePage.jsx
│   │   │   └── HomePage.module.css
│   │   ├── ProfilePage/
│   │   │   ├── ProfilePage.jsx
│   │   │   └── ProfilePage.module.css
│   │   ├── ChatPage/
│   │   │   ├── ChatPage.jsx
│   │   │   └── ChatPage.module.css
│   │   └── AuthPage/
│   │       ├── AuthPage.jsx
│   │       └── AuthPage.module.css
│   │
│   ├── components/              # Reusable UI components
│   │   ├── common/              # Generic components
│   │   │   ├── Button/
│   │   │   │   ├── Button.jsx
│   │   │   │   └── Button.module.css
│   │   │   ├── Modal/
│   │   │   │   ├── Modal.jsx
│   │   │   │   └── Modal.module.css
│   │   │   ├── Avatar/
│   │   │   │   ├── Avatar.jsx
│   │   │   │   └── Avatar.module.css
│   │   │   └── LoadingSpinner/
│   │   │       ├── LoadingSpinner.jsx
│   │   │       └── LoadingSpinner.module.css
│   │   │
│   │   ├── feed/                # Feed-specific components
│   │   │   ├── PostCard/
│   │   │   │   ├── PostCard.jsx
│   │   │   │   └── PostCard.module.css
│   │   │   ├── CreatePost/
│   │   │   │   ├── CreatePost.jsx
│   │   │   │   └── CreatePost.module.css
│   │   │   ├── Stories/
│   │   │   │   ├── Stories.jsx
│   │   │   │   └── Stories.module.css
│   │   │   └── CommentSection/
│   │   │       ├── CommentSection.jsx
│   │   │       └── CommentSection.module.css
│   │   │
│   │   ├── profile/             # Profile components
│   │   │   ├── ProfileHeader/
│   │   │   │   ├── ProfileHeader.jsx
│   │   │   │   └── ProfileHeader.module.css
│   │   │   ├── PostGrid/
│   │   │   │   ├── PostGrid.jsx
│   │   │   │   └── PostGrid.module.css
│   │   │   └── EditProfile/
│   │   │       ├── EditProfile.jsx
│   │   │       └── EditProfile.module.css
│   │   │
│   │   └── chat/                # Chat components
│   │       ├── ConversationList/
│   │       │   ├── ConversationList.jsx
│   │       │   └── ConversationList.module.css
│   │       ├── MessageBubble/
│   │       │   ├── MessageBubble.jsx
│   │       │   └── MessageBubble.module.css
│   │       └── ChatInput/
│   │           ├── ChatInput.jsx
│   │           └── ChatInput.module.css
│   │
│   └── layout/                  # Layout components
│       ├── AppLayout/
│       │   ├── AppLayout.jsx
│       │   └── AppLayout.module.css
│       ├── Navbar/
│       │   ├── Navbar.jsx
│       │   └── Navbar.module.css
│       └── Sidebar/
│           ├── Sidebar.jsx
│           └── Sidebar.module.css
│
├── 📁 store/                    # Global State Management
│   ├── slices/
│   │   ├── authSlice.js
│   │   ├── postsSlice.js
│   │   ├── usersSlice.js
│   │   ├── messagesSlice.js
│   │   └── notificationsSlice.js
│   ├── middleware/
│   │   ├── socketMiddleware.js
│   │   └── apiMiddleware.js
│   └── store.js
│
├── 📁 services/                 # Business Logic Services
│   ├── auth.service.js
│   ├── socket.service.js
│   ├── upload.service.js
│   ├── notification.service.js
│   └── utils/
│       ├── dateUtils.js
│       ├── imageUtils.js
│       └── validationUtils.js
│
├── 📁 hooks/                    # Custom React Hooks
│   ├── useSocket.js
│   ├── useDebounce.js
│   ├── useInfiniteScroll.js
│   └── useLocalStorage.js
│
├── 📁 constants/               # App Constants
│   ├── api.constants.js
│   ├── routes.constants.js
│   └── theme.constants.js
│
├── 📁 styles/                  # Global Styles
│   ├── globals.css             # Global CSS variables
│   ├── themes/
│   │   ├── light.css
│   │   └── dark.css
│   └── mixins/
│       ├── neomorphism.css
│       └── animations.css
│
├── App.jsx                     # Main App component
├── index.js                    # Entry point
└── routes.jsx                  # Route configuration
```

---

## 🔧 Backend Structure (MVC Pattern)

```
server/
├── 📁 controllers/             # Request/Response Logic
│   ├── auth.controller.js
│   ├── posts.controller.js
│   ├── users.controller.js
│   ├── messages.controller.js
│   ├── stories.controller.js
│   ├── reels.controller.js
│   └── notifications.controller.js
│
├── 📁 models/                  # Data Models
│   ├── User.model.js
│   ├── Post.model.js
│   ├── Story.model.js
│   ├── Reel.model.js
│   ├── Message.model.js
│   └── Notification.model.js
│
├── 📁 services/               # Business Logic
│   ├── auth.service.js
│   ├── posts.service.js
│   ├── users.service.js
│   ├── messages.service.js
│   ├── upload.service.js
│   ├── notification.service.js
│   └── socket.service.js
│
├── 📁 middleware/             # Express Middleware
│   ├── auth.middleware.js
│   ├── validation.middleware.js
│   ├── upload.middleware.js
│   ├── rateLimit.middleware.js
│   └── error.middleware.js
│
├── 📁 routes/                 # API Routes
│   ├── auth.routes.js
│   ├── posts.routes.js
│   ├── users.routes.js
│   ├── messages.routes.js
│   ├── stories.routes.js
│   ├── reels.routes.js
│   └── notifications.routes.js
│
├── 📁 validators/             # Input Validation
│   ├── auth.validator.js
│   ├── post.validator.js
│   ├── user.validator.js
│   └── message.validator.js
│
├── 📁 utils/                  # Utility Functions
│   ├── jwt.utils.js
│   ├── bcrypt.utils.js
│   ├── upload.utils.js
│   └── socket.utils.js
│
├── 📁 config/                 # Configuration
│   ├── database.config.js
│   ├── socket.config.js
│   └── upload.config.js
│
└── server.js                  # Entry point
```

---

## 🔄 Data Flow Architecture

### **1. Frontend Data Flow (MVVM)**
```
User Action → View → ViewModel → Model → API Service → Backend
```

### **2. Backend Data Flow (MVC)**
```
API Request → Route → Controller → Service → Model → Database
```

### **3. Real-time Flow (Socket.io)**
```
Client Event → Socket Service → Controller → Broadcast → All Clients
```

---

## 🎨 CSS Architecture

### **1. Design System Structure**
```
styles/
├── globals.css              # CSS custom properties, reset
├── themes/
│   ├── light.css           # Light theme variables
│   └── dark.css            # Dark theme variables
├── mixins/
│   ├── neomorphism.css     # Neomorphism mixins
│   ├── animations.css      # Animation utilities
│   └── responsive.css      # Responsive mixins
└── components/             # Component-specific styles
    └── [ComponentName].module.css
```

### **2. CSS Module Naming Convention**
```css
/* Component.module.css */
.componentName { }          /* Main component wrapper */
.componentName__element { } /* BEM-style element */
.componentName--modifier { }/* BEM-style modifier */
.isActive { }              /* State classes */
.hasError { }              /* Conditional classes */
```

---

## 🚀 Implementation Benefits

### **1. Maintainability**
- Clear separation of concerns
- Reusable components and logic
- Consistent patterns across the app

### **2. Scalability**
- Modular architecture
- Easy to add new features
- Independent component development

### **3. Testability**
- Isolated business logic in ViewModels
- Pure presentation components
- Mockable API services

### **4. Developer Experience**
- Clear file organization
- Consistent naming conventions
- Easy to navigate codebase

---

## 📊 Architecture Comparison

| Aspect | Before | After |
|--------|--------|-------|
| **Structure** | Mixed concerns | Clear separation |
| **State** | Local useState | Global + Local state |
| **API** | Direct fetch calls | Service layer |
| **Logic** | In components | In ViewModels |
| **Styling** | Mixed CSS | CSS Modules |
| **Testing** | Difficult | Easy to test |

---

This architecture provides a solid foundation for building scalable, maintainable React applications with proper separation of concerns and clean code organization.