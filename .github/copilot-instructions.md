# CortexAI Copilot Instructions

## Project Overview
Monorepo with microservices: client (Next.js), gateway (NestJS), auth (NestJS), report-service (NestJS).
Shared packages: `@cortex/shared` (types, schemas), `@cortex/backend-common` (filters, interceptors).

## Frontend Libraries (client/)

### Next.js 16 + React 19
- Use App Router (`src/app/`), not Pages Router
- Server Components by default, add `"use client"` only when needed (hooks, state, refs)
- React Compiler enabled — keep components pure

### React Hook Form v7 + Zod
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginDtoType } from '@cortex/shared';

const form = useForm<LoginDtoType>({
  resolver: zodResolver(loginSchema),
  defaultValues: { email: '', password: '' },
});
```
- Always use `zodResolver` with schemas from `@cortex/shared`
- Prefer `register()` for simple inputs, `Controller` for complex (select, datepicker)

### TanStack Query v5
```typescript
import { useQuery, useMutation } from '@tanstack/react-query';

// Queries - use array keys
const { data } = useQuery({
  queryKey: ['users', userId],
  queryFn: () => fetchUser(userId),
});

// Mutations - invalidate on success
const mutation = useMutation({
  mutationFn: createUser,
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
});
```

### Axios
- HTTP client configured in `src/services/http/`
- Use `httpFactory.createAuthClient()` for authenticated requests
- Use `httpFactory.createPublicClient()` for public requests
- Proxy through `/api/proxy` for CSR to handle cookies

### Tailwind CSS v4
- Use `@import "tailwindcss";` and `@theme inline` syntax
- Prefer semantic tokens: `bg-card`, `text-muted-foreground`, `border-border`
- Dark mode via `darkMode: "class"` on `<html>`

### Other Frontend
- **lucide-react**: Icon library, import individually `import { User } from 'lucide-react'`
- **next-themes**: Theme switching, use `useTheme()` hook
- **react-hot-toast**: Notifications, use `toast.success()`, `toast.error()`

## Backend Libraries (auth/, gateway/)

### NestJS 11
- Modular architecture: `*.module.ts`, `*.controller.ts`, `*.service.ts`
- Use Dependency Injection via constructor
- Guards for auth: `@UseGuards(AtGuard)`
- Pipes for validation: `ZodValidationPipe` globally applied

### Prisma 7
```typescript
// New config format in prisma.config.ts (not schema.prisma url)
import { defineConfig } from 'prisma/config';
export default defineConfig({
  datasource: { url: process.env.DATABASE_URL },
});

// Service pattern
@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}
  
  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }
}
```

### Passport JWT + Argon2
- Access token: short-lived (1h), in Authorization header
- Refresh token: long-lived (7d), hashed with Argon2 in DB
- Use `@nestjs/passport` with `passport-jwt` strategy

### nestjs-zod
- Validation pipe: `app.useGlobalPipes(new ZodValidationPipe())`
- DTOs extend Zod schemas from `@cortex/shared`
- Swagger integration via `@asteasolutions/zod-to-openapi`

### Throttler + Redis
```typescript
ThrottlerModule.forRoot({
  throttlers: [{ ttl: 60000, limit: 10 }],
  storage: new ThrottlerStorageRedisService(new Redis({ host, port })),
})
```

### Other Backend
- **helmet**: Security headers, `app.use(helmet())`
- **@nestjs/swagger**: Auto-generate API docs at `/api`
- **@nestjs/axios**: HTTP client for service-to-service calls
- **cookie-parser**: Parse cookies for refresh token flow

## Shared Package (@cortex/shared)

### Zod Schemas
```typescript
// Always import from shared, not define locally
import { loginSchema, registerSchema, LoginDtoType } from '@cortex/shared';
```

### Constants
```typescript
import { AppErrors, ApiRoutes } from '@cortex/shared';
// AppErrors.AUTH.INVALID_CREDENTIALS
// ApiRoutes.AUTH.LOGIN
```

## Code Style

- TypeScript strict mode enabled
- Prefer `const` over `let`
- Use async/await, not callbacks
- Error handling: throw NestJS exceptions (`UnauthorizedException`, etc.)
- Logging: use `Logger` from `@nestjs/common`

## File Structure Conventions

```
src/
├── app/              # Next.js routes (client)
├── components/       # React components
├── services/         # API clients, business logic
├── modules/          # NestJS modules (backend)
│   └── auth/
│       ├── auth.module.ts
│       ├── auth.controller.ts
│       ├── auth.service.ts
│       └── dto/
└── common/           # Shared utilities per service
    ├── guards/
    ├── filters/
    └── interceptors/
```

---

## Original Frontend Instructions

- Stack: Next.js 16 (App Router) with React 19, Tailwind CSS v4, TypeScript, next-themes, and React Compiler enabled in `next.config.ts`.
- Entrypoint layout: `src/app/layout.tsx` loads Montserrat via `next/font`, wraps children in the custom `ThemeProvider`, and exposes metadata (title/description). Keep the `html` tag `suppressHydrationWarning` and preserve the theme wrapper when adding pages.
- Theming: `src/components/provider/themeProvider.component.tsx` is a thin `next-themes` wrapper; default theme is `purple` with allowed themes `light`, `dark`, `purple`. Use `className="bg-background text-foreground ..."` style tokens; they map to CSS variables defined per theme in `src/app/globals.css`.
- CSS tokens: `globals.css` defines semantic variables for background/foreground, card, popover, primary/secondary/muted/accent/destructive/border/input/ring. Tailwind v4 `@theme inline` maps these to Tailwind color tokens. When adding styles, prefer semantic tokens (e.g., `bg-card`, `text-muted-foreground`, `border-border`) instead of raw hex values.
- Pages: `src/app/page.tsx` currently a blank hero container; `src/app/login/page.tsx` is the styled login screen with Ukrainian copy and lucide/google icons; `src/app/register/page.tsx` is a placeholder. Preserve the Ukrainian language and CTA flow when iterating on auth UI.
- Icons: login page imports `lucide-react` icons; ensure the dependency is present if adding more icons. A custom Google SVG is inlined; follow that pattern for provider buttons.
- Empty scaffolds: `src/api`, `src/hooks`, and `src/services` exist but are empty—create modules there instead of crowding `app/` when adding data fetching or client helpers.
- Dark mode: `tailwind.config.ts` uses `darkMode: "class"`; theme switching relies on the `class` on `<html>`. Don’t switch to `media`.
- Fonts: Keep Montserrat config (`variable: "--font-montserrat"`) and apply the variable on `<body>` when altering layout.
- Layout/spacing: pages use full-height flex containers (`min-h-screen`, centered content) with border/background tokens; reuse these patterns for consistency.
- Internationalization: Copy is currently Ukrainian; avoid mixing languages unless introducing a deliberate localization strategy.
- Scripts: `npm run dev`, `npm run build`, `npm run start`, `npm run lint`. No custom test commands defined.
- Preferred additions: place shared UI primitives in `src/components`, providers in `src/components/provider`, and keep App Router segments colocated under `src/app/<route>/page.tsx`.
- Data fetching: no server actions or API routes yet. If adding, prefer App Router conventions (`route.ts`) inside `src/app/api/...` and keep client components `"use client"`-scoped.
- Styling tips: Tailwind v4 uses the new `@import "tailwindcss";` and `@theme inline` approach—avoid older `@tailwind base/components/utilities` style imports.
- Accessibility: follow Next.js `<Link>` for navigation; inputs use labeled fields—continue that pattern and keep focus/hover rings with existing token-based colors.
- Deployment: README is default create-next-app; assume Vercel-compatible. Avoid adding node APIs that block edge/runtime flexibility unless justified.
- Performance: React Compiler is on; keep components pure where possible and avoid unnecessary `use client` unless required by state/hooks/refs.
- Testing gap: there are no automated tests. When adding critical features, consider creating minimal integration tests or storybook-like examples (not yet configured).
