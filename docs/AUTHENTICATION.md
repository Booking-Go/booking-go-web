# Authentication Design - NextAuth.js Integration

**Version:** 1.0  
**Date:** February 10, 2026

---

## Overview

Booking.go uses **NextAuth.js v5 (Auth.js)** for authentication, providing secure session management, CSRF protection, and flexible authentication strategies.

---

## 1. Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Frontend (Next.js)                    │
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │  NextAuth.js (Auth.js v5)                        │   │
│  │  - Session Management                            │ │
│  │  - CSRF Protection                               │ │
│  │  - Token Refresh                                 │ │
│  └──────────────┬───────────────────────────────────┘ │
└─────────────────┼───────────────────────────────────────┘
                  │
                  │ HTTP + JWT
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│              Backend API (Express)                      │
│                                                         │
│  ┌──────────────────────────────────────────────────┐ │
│  │  JWT Validation Middleware                       │ │
│  │  - Verify token signature                        │ │
│  │  - Extract user info                             │ │
│  │  - Role-based access control                     │ │
│  └──────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## 2. NextAuth.js Configuration

### 2.1 Auth Options

```typescript
// src/lib/auth.ts
import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { apiClient } from "./api"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          // Call backend API to authenticate
          const response = await apiClient.post('/auth/login', {
            email: credentials.email,
            password: credentials.password,
          })

          const { user, tokens } = response.data.data

          if (user && tokens) {
            return {
              id: user.id,
              email: user.email,
              name: `${user.firstName} ${user.lastName}`,
              role: user.role,
              accessToken: tokens.accessToken,
              refreshToken: tokens.refreshToken,
            }
          }

          return null
        } catch (error) {
          return null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in
      if (user) {
        token.accessToken = user.accessToken
        token.refreshToken = user.refreshToken
        token.role = user.role
        token.userId = user.id
      }

      // Token refresh logic (check if token expired)
      // If expired, use refreshToken to get new accessToken
      
      return token
    },
    async session({ session, token }) {
      session.user.id = token.userId as string
      session.user.role = token.role as string
      session.accessToken = token.accessToken as string
      
      return session
    }
  },
  pages: {
    signIn: '/login',
    signOut: '/logout',
    error: '/auth/error',
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
})
```

### 2.2 API Route Handler

```typescript
// src/app/api/auth/[...nextauth]/route.ts
import { handlers } from "@/lib/auth"

export const { GET, POST } = handlers
```

### 2.3 Environment Variables

```bash
# .env.local
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-key-min-32-chars
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

---

## 3. Session Management

### 3.1 Server-Side Session Access

```typescript
// In Server Components or API Routes
import { auth } from "@/lib/auth"

export default async function DashboardPage() {
  const session = await auth()
  
  if (!session) {
    redirect('/login')
  }

  return (
    <div>
      <h1>Welcome {session.user.name}</h1>
      <p>Role: {session.user.role}</p>
    </div>
  )
}
```

### 3.2 Client-Side Session Access

```typescript
// In Client Components
"use client"

import { useSession } from "next-auth/react"

export function ProfileButton() {
  const { data: session, status } = useSession()

  if (status === "loading") return <div>Loading...</div>
  if (!session) return <a href="/login">Sign in</a>

  return (
    <div>
      <p>{session.user.name}</p>
      <p>{session.user.role}</p>
    </div>
  )
}
```

### 3.3 Session Provider

```typescript
// src/app/layout.tsx
import { SessionProvider } from "next-auth/react"

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}
```

---

## 4. Protected Routes

### 4.1 Middleware Protection

```typescript
// middleware.ts
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { pathname } = req.nextUrl
  const session = req.auth

  // Public routes
  const publicRoutes = ['/', '/login', '/register', '/explore']
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  // Protected routes
  if (!session) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // Business owner only routes
  if (pathname.startsWith('/dashboard') && session.user.role !== 'business_owner') {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
```

### 4.2 Page-Level Protection

```typescript
// src/app/dashboard/page.tsx
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const session = await auth()

  if (!session || session.user.role !== 'business_owner') {
    redirect('/')
  }

  return <DashboardContent />
}
```

---

## 5. API Client Integration

### 5.1 Authenticated API Client

```typescript
// src/lib/api.ts
import axios from 'axios'
import { getSession } from 'next-auth/react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - add auth token
apiClient.interceptors.request.use(
  async (config) => {
    const session = await getSession()
    
    if (session?.accessToken) {
      config.headers.Authorization = `Bearer ${session.accessToken}`
    }
    
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor - handle errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Session expired, redirect to login
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)
```

---

## 6. Authentication Flow

### 6.1 Login Flow

```
User → Login Form → NextAuth.js → Backend /auth/login
                        ↓
                    JWT Tokens
                        ↓
                  Store in session
                        ↓
                  Redirect to Dashboard
```

### 6.2 Registration Flow

```
User → Register Form → Backend /auth/register
                            ↓
                    Auto-login via NextAuth
                            ↓
                      Redirect to Dashboard
```

### 6.3 Token Refresh Flow

```typescript
// In JWT callback
async jwt({ token, user }) {
  // Check if token is expired
  const now = Date.now() / 1000
  
  if (token.exp && now > token.exp - 300) { // 5 min before expiry
    try {
      const response = await apiClient.post('/auth/refresh', {
        refreshToken: token.refreshToken
      })
      
      return {
        ...token,
        accessToken: response.data.accessToken,
        exp: now + 900, // 15 minutes
      }
    } catch (error) {
      return { ...token, error: "RefreshTokenError" }
    }
  }
  
  return token
}
```

---

## 7. Backend JWT Validation

### 7.1 Middleware

```typescript
// backend/src/middleware/auth.ts
import jwt from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express'

export interface AuthRequest extends Request {
  user?: {
    userId: string
    email: string
    role: string
  }
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]

    if (!token) {
      return res.status(401).json({
        success: false,
        error: { code: 'NO_TOKEN', message: 'No token provided' }
      })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role
    }
    
    next()
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: { code: 'INVALID_TOKEN', message: 'Invalid or expired token' }
    })
  }
}
```

---

## 8. Role-Based Access Control

### 8.1 Frontend

```typescript
// src/components/ProtectedContent.tsx
"use client"

import { useSession } from "next-auth/react"

interface Props {
  allowedRoles: string[]
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function ProtectedContent({ allowedRoles, children, fallback }: Props) {
  const { data: session } = useSession()

  if (!session || !allowedRoles.includes(session.user.role)) {
    return fallback || null
  }

  return <>{children}</>
}

// Usage
<ProtectedContent allowedRoles={['business_owner', 'admin']}>
  <BusinessDashboard />
</ProtectedContent>
```

### 8.2 Backend

```typescript
// backend/src/middleware/auth.ts
export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Insufficient permissions'
        }
      })
    }
    next()
  }
}

// Usage
router.post('/businesses', authenticate, authorize('business_owner', 'admin'), createBusiness)
```

---

## 9. Security Best Practices

### 9.1 Token Security

✅ **DO:**
- Use HTTPS in production
- Set secure, httpOnly cookies
- Implement CSRF protection (NextAuth handles this)
- Short access token expiry (15 min)
- Longer refresh token expiry (30 days)

❌ **DON'T:**
- Store tokens in localStorage
- Send tokens in URL parameters
- Use weak JWT secrets
- Skip token validation on backend

### 9.2 Session Security

```typescript
// next-auth config
export const authConfig = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    }
  }
}
```

---

## 10. Testing Authentication

### 10.1 Manual Testing

```bash
# Login
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Use token
curl http://localhost:5000/api/v1/users/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 10.2 Frontend Testing

```typescript
// Test protected route
it('redirects to login when not authenticated', async () => {
  const { container } = render(<DashboardPage />)
  expect(window.location.pathname).toBe('/login')
})

// Test role-based access
it('shows content for authorized role', async () => {
  mockSession({ user: { role: 'business_owner' } })
  const { getByText } = render(<BusinessDashboard />)
  expect(getByText('Business Dashboard')).toBeInTheDocument()
})
```

---

## Summary

- ✅ NextAuth.js v5 for session management
- ✅ JWT strategy for stateless auth
- ✅ Secure token refresh mechanism
- ✅ Role-based access control
- ✅ CSRF protection built-in
- ✅ Server and client-side auth checks
- ✅ Middleware-based route protection

**Next Steps:**
1. Set up NextAuth configuration
2. Implement backend JWT validation
3. Test authentication flow
4. Add social providers (optional)
5. Set up rate limiting for auth endpoints
