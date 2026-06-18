Got it. Here's the full, deeply detailed rulebook in plain text:

---

# PRODUCTION ENGINEERING & SECURITY RULEBOOK
## Comprehensive Edition — AI-Generated Applications

---

# RULE 1: SECRETS AND ENVIRONMENT VARIABLES

**Core Principle:** A secret that touches the frontend is no longer a secret.

**What counts as a secret:**
- API keys (OpenAI, Anthropic, Stripe, Twilio, etc.)
- Database connection strings and credentials
- JWT signing secrets
- OAuth client secrets
- Webhook signing secrets
- Internal service tokens
- Encryption keys and salts
- SMTP credentials
- Cloud provider keys (AWS, GCP, Azure)
- Any value that grants access to a system or resource

**Where secrets must live:**
- Server-side only, in `process.env` or equivalent
- Secret managers: AWS Secrets Manager, GCP Secret Manager, HashiCorp Vault, Doppler
- CI/CD secret stores: GitHub Actions Secrets, Vercel Environment Variables (server-only)
- Never in source code, even temporarily
- Never in comments, even "for testing"
- Never in commit history — if it was committed once, rotate it immediately

**Frontend environment variables:**
- Only `NEXT_PUBLIC_*` or `VITE_*` prefixed variables may reach the browser
- These must contain zero sensitive data — treat them as fully public
- Acceptable: public Stripe publishable key, public analytics IDs, public app URLs
- Never acceptable: secret keys, private tokens, internal service URLs with credentials

**File rules:**
- `.env`, `.env.local`, `.env.production`, `.env.staging` → always in `.gitignore`
- Commit only `.env.example` with empty or fake placeholder values
- Audit your `.gitignore` before every first push to a new repo

**Rotation policy:**
- Rotate all secrets on a schedule (quarterly minimum)
- Rotate immediately on: team member departure, suspected breach, accidental exposure
- Automate rotation where possible using secret managers

---

# RULE 2: ENCRYPTION AND DATA PROTECTION

**Core Principle:** Assume data will be stolen. Make stolen data useless.

**In transit:**
- HTTPS/TLS 1.2 minimum, TLS 1.3 preferred, everywhere, always
- No HTTP fallback in production, ever
- HSTS must be enabled with a minimum `max-age` of 1 year
- Use `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`
- Redirect all HTTP → HTTPS at the infrastructure level, not just application level
- Certificate auto-renewal must be configured (Let's Encrypt, AWS ACM, Cloudflare)
- Internal service-to-service communication must also use TLS

**At rest:**
- Sensitive database fields (SSNs, payment info, health data, government IDs) must be encrypted at the field level, not just disk-level
- Use AES-256 for symmetric encryption
- Manage encryption keys separately from the data they protect
- Disk-level encryption (AWS EBS encryption, RDS encryption) is a minimum baseline, not sufficient alone for sensitive fields

**Passwords specifically:**
- Store only the hash, never the plaintext, never a reversible encoding
- Use bcrypt with cost factor ≥ 12, or argon2id with recommended parameters
- Never use MD5, SHA1, SHA256, or any fast hash for passwords — they are not password hashing algorithms
- Never use encryption for passwords — if you can decrypt it, attackers can too
- On login, use constant-time comparison to prevent timing attacks

**Cookies:**
- All session/auth cookies must have `HttpOnly` — no JavaScript access
- All session/auth cookies must have `Secure` — HTTPS only
- `SameSite=Strict` or `Lax` depending on your cross-origin requirements
- Set explicit `Path` and `Domain` attributes
- Set appropriate expiry — do not use session cookies for long-lived auth

**What to never log:**
- Passwords in any form
- Full credit card numbers or CVVs
- Social security or national ID numbers
- Auth tokens, refresh tokens, session IDs
- Private keys or secrets of any kind
- Full request bodies when they may contain sensitive fields
- Strip sensitive fields before logging request/response payloads

---

# RULE 3: AUTHENTICATION AND AUTHORIZATION

**Core Principle:** Authentication proves who you are. Authorization proves what you're allowed to do. Both must be verified on every single request.

**Use established providers — do not build auth from scratch:**
- NextAuth / Auth.js
- Clerk
- Supabase Auth
- Auth0 / Okta
- Firebase Auth
- Lucia Auth
- Reason: auth is extraordinarily hard to implement correctly; every custom implementation has exploitable gaps

**Authentication requirements:**
- Every protected route must verify authentication before any logic runs
- Verify on the server — never trust frontend auth state for access control
- Middleware-level auth checks are good; they are not sufficient alone — also check at the handler level
- Short-lived access tokens: 15 minutes to 1 hour is standard
- Refresh tokens: longer-lived, stored in `HttpOnly` cookies only, never in `localStorage`
- Implement token rotation on refresh — each use of a refresh token issues a new one
- Implement refresh token reuse detection — if an old refresh token is used, invalidate all tokens for that user

**Authorization requirements:**
- After confirming a user is authenticated, confirm they are authorized for the specific resource
- Verify ownership: "user 42 is authenticated" ≠ "user 42 owns resource 99"
- Example: `GET /api/documents/:id` must verify both that the user is logged in AND that they own or have explicit permission to access that document
- Never use sequential integer IDs for resources in URLs without ownership verification — use UUIDs
- Check authorization in the service/data layer, not just the route layer

**MFA:**
- Required for: admin accounts, accounts with billing/payment access, accounts that can manage other users
- Strongly recommended for all users
- Support TOTP (Google Authenticator, Authy) at minimum
- Recovery codes must be generated, hashed before storage, shown once to user

**Brute force protection:**
- Lock accounts after 5–10 failed login attempts
- Implement exponential backoff on failed attempts
- Use CAPTCHA on login after repeated failures
- Alert users of failed login attempts via email

---

# RULE 4: RBAC AND PRINCIPLE OF LEAST PRIVILEGE

**Core Principle:** Every actor — user, service, database user, API key — should have access to exactly what it needs and nothing more.

**Role-Based Access Control (RBAC):**
- Define roles explicitly: e.g., `viewer`, `editor`, `admin`, `super_admin`
- Assign permissions to roles, not to individual users where possible
- Store role assignments in the database, verify server-side on every request
- Never derive roles from JWT claims alone without server-side verification
- Never store roles in `localStorage` or cookies without server-side verification

**Per-request access checks — all three must pass:**
1. Is the user authenticated? (valid session/token)
2. Is the user authorized for this action? (has the required role/permission)
3. Does the user own or have explicit permission on this specific resource?

**Database users and credentials:**
- Application database user: SELECT, INSERT, UPDATE, DELETE only on required tables
- Migration database user: separate, used only during migrations, not in the running app
- Read-only replicas should use read-only credentials
- No application should connect as root or superuser
- Separate credentials per service in a microservices architecture

**API keys:**
- Scope API keys to specific resources and operations (read-only keys, write keys, admin keys)
- Allow users to create multiple API keys with different scopes
- Never issue all-access API keys by default
- Log all API key usage

**Admin routes:**
- All admin routes require explicit admin role check — middleware is not enough alone
- Admin routes should be on a separate subdomain or path that can be IP-restricted
- Admin actions should be fully audit logged

---

# RULE 5: SESSION MANAGEMENT

**Core Principle:** Sessions are the keys to the kingdom. Treat them accordingly.

**Session lifecycle:**
- Generate a new session ID on every login — never reuse pre-auth session IDs
- This prevents session fixation attacks
- Invalidate sessions on: logout, password change, email change, suspicious activity detection
- Provide users with a "log out all devices" option

**Session storage:**
- Session data lives server-side (database, Redis)
- The client receives only a session identifier, stored in an `HttpOnly` cookie
- Never store session data in `localStorage` or `sessionStorage` — accessible to JavaScript, vulnerable to XSS
- Never put the session token in URLs — it ends up in logs, referrer headers, browser history

**Session expiry:**
- Absolute expiry: sessions expire regardless of activity (e.g., 24 hours, 7 days)
- Idle/inactivity expiry: sessions expire after a period of inactivity (e.g., 30 minutes for sensitive apps)
- Implement sliding windows for inactivity expiry — each request resets the timer
- Warn users before session expiry so they can save work

**Token storage summary:**
- Access tokens: memory only (React state, Zustand, etc.) — never localStorage
- Refresh tokens: `HttpOnly` secure cookie only
- Session IDs: `HttpOnly` secure cookie only
- If you must use localStorage for something, it must never be a security credential

---

# RULE 6: RATE LIMITING AND ABUSE PREVENTION

**Core Principle:** Every public endpoint is a target. Unprotected endpoints will be abused.

**Minimum rate limits:**

| Endpoint Type | Limit | Window | Key |
|---|---|---|---|
| Login / Register | 5 requests | 15 minutes | Per IP |
| Password reset | 3 requests | 1 hour | Per IP + email |
| Email verification | 5 requests | 1 hour | Per user |
| General API | 60 requests | 1 minute | Per IP |
| Authenticated API | 300 requests | 1 minute | Per user |
| AI / LLM endpoints | 10 requests | 1 minute | Per user |
| File uploads | 5 requests | 1 minute | Per IP |
| Search endpoints | 30 requests | 1 minute | Per IP |
| Webhooks (outbound) | Implement retry limits with backoff | | |

**Implementation requirements:**
- Use Redis-backed rate limiting for distributed systems (not in-memory — doesn't work across multiple servers)
- Libraries: `express-rate-limit` + `rate-limit-redis`, `@upstash/ratelimit`, `slowapi` (Python)
- Return `429 Too Many Requests` with a `Retry-After` header
- Include `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset` headers
- Distinguish between soft limits (slow down) and hard limits (block)

**Beyond basic rate limiting:**
- Detect credential stuffing: many failed logins across many accounts from same IP
- Detect account enumeration: timing differences in "user not found" vs "wrong password"
- Bot detection: honeypot fields, CAPTCHA, behavioral analysis
- Anomaly detection: alert on usage spikes significantly above baseline
- Geographic blocking: block or flag requests from unexpected geographies
- Implement exponential backoff for repeated violations — don't just reset every window

---

# RULE 7: INPUT VALIDATION AND SANITIZATION

**Core Principle:** All user input is malicious until proven otherwise. Validate everything, server-side, always.

**Where validation must happen:**
- Server-side, in every API route handler or middleware, always
- Client-side validation is a UX convenience, never a security control
- Validate at the boundary — the moment data enters your system

**What to validate:**
- **Type:** Is this actually a number? A string? A boolean?
- **Format:** Does this email match an email regex? Is this a valid UUID? Is this a valid date?
- **Length:** Minimum and maximum length on all string inputs. No unbounded strings.
- **Range:** Is this number within acceptable bounds?
- **Enum:** Is this value one of the allowed options?
- **Required fields:** Reject requests missing mandatory fields
- **Unexpected fields:** Strip or reject fields not in your schema (strict mode)
- **Array length:** Maximum number of items in arrays
- **Nesting depth:** Maximum nesting depth on JSON payloads
- **File types and sizes:** See Rule 12

**Recommended libraries:**
- TypeScript/JavaScript: Zod (preferred), Joi, Yup, Valibot
- Python: Pydantic (preferred), Marshmallow, Cerberus
- Go: validator package
- Define schemas once, reuse across validation and TypeScript types

**Zod example:**
```ts
const CreateUserSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(12).max(128),
  name: z.string().min(1).max(100).trim(),
  role: z.enum(['viewer', 'editor']), // never allow 'admin' from client
  age: z.number().int().min(13).max(120).optional(),
});
```

**Sanitization:**
- Trim whitespace from string inputs
- Normalize unicode where appropriate
- Sanitize HTML if you accept rich text — use DOMPurify (browser) or sanitize-html (server)
- Escape dynamic content in templates
- Do not sanitize and then re-process — sanitize as the last step before use

**Error responses:**
- Return `400 Bad Request` with clear but non-revealing validation errors
- Do not expose internal field names or schema details in error messages
- Log full validation failures server-side for monitoring

---

# RULE 8: DATABASE SECURITY

**Core Principle:** The database is the most valuable target. Never give it raw user input directly.

**Parameterized queries — mandatory:**
- Never concatenate user input into SQL strings — this is SQL injection, one of the most critical vulnerabilities
- Use ORMs: Prisma, Drizzle (JS/TS), SQLAlchemy (Python), ActiveRecord (Ruby)
- If writing raw SQL, use parameterized queries with placeholders: `WHERE id = $1` not `WHERE id = ${id}`
- ORMs don't guarantee safety if you pass raw user input into `.where()` using raw SQL methods — validate inputs first

**Access control:**
- Application DB user has only necessary permissions — no CREATE, DROP, ALTER in production
- Separate read and write connections where possible
- Use row-level security (RLS) in PostgreSQL for multi-tenant applications (Supabase does this well)
- Never connect from the application as a DBA/root user

**Error handling:**
- Never expose raw database errors to clients — they reveal table names, column names, query structure
- Catch DB errors, log them server-side with full detail, return a generic "something went wrong" to the client
- Map known error codes to user-friendly messages: unique constraint violation → "that email is already taken"

**Data integrity:**
- Use database-level constraints: NOT NULL, UNIQUE, FOREIGN KEY, CHECK
- Do not rely solely on application-level validation — the database is the last line of defense
- Use transactions for multi-step operations that must succeed or fail together

**Backups:**
- Automated daily backups at minimum, hourly for critical data
- Test restores on a schedule — a backup you've never tested is not a backup
- Store backups in a separate account/region from the primary database
- Retain backups for a minimum of 30 days
- Encrypt backups at rest

---

# RULE 9: API SECURITY

**Core Principle:** Every API endpoint is a contract. Enforce it strictly.

**Route-level requirements:**
- Every protected endpoint: verify authentication first, then authorization, then process
- Restrict HTTP methods: if a route only accepts POST, return `405 Method Not Allowed` on GET/PUT/DELETE
- Validate Content-Type headers — reject unexpected content types
- Return minimal data: never return full database rows when only a few fields are needed
- Never expose internal IDs, implementation details, stack traces, or system paths

**Request/response design:**
- Use consistent response envelopes: `{ data: ..., error: null }` or `{ data: null, error: { message, code } }`
- Version your API: `/api/v1/`, `/api/v2/` — never break existing clients silently
- Use HTTP status codes correctly: 200, 201, 400, 401, 403, 404, 409, 422, 429, 500
- 401 = not authenticated; 403 = authenticated but not authorized — use correctly

**Idempotency:**
- Payment and critical mutation endpoints must support idempotency keys
- Client sends a unique `Idempotency-Key` header
- Server stores the result of the first request and returns it for duplicates
- Prevents double-charges and duplicate operations from retries

**API keys for external clients:**
- Generate cryptographically random keys
- Hash API keys before storing — never store raw API keys (same principle as passwords)
- Show the key to the user exactly once at creation
- Scope keys to specific operations
- Log all API key usage with timestamp, IP, endpoint

---

# RULE 10: CORS CONFIGURATION

**Core Principle:** Wildcard CORS is an open door. Know exactly who you're letting in.

**Production requirements:**
- Explicitly whitelist allowed origins: `['https://yourapp.com', 'https://app.yourapp.com']`
- Never use `*` (wildcard) in production for authenticated endpoints
- Wildcard is acceptable only for fully public, unauthenticated, read-only APIs (e.g., a public CDN)

**Configuration:**
- Allow only the HTTP methods your API actually uses
- Allow only the headers your API actually needs
- `credentials: true` only when you need to send cookies cross-origin, and only with explicit origin (not wildcard)
- Set an appropriate `max-age` for preflight cache

**Express example:**
```js
cors({
  origin: ['https://yourapp.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400,
})
```

**Common mistakes:**
- Dynamically reflecting the `Origin` header without a whitelist check — this defeats CORS entirely
- Allowing `null` origin — used by local files and can be spoofed
- Setting `credentials: true` with `origin: '*'` — browsers reject this but it signals confused config

---

# RULE 11: SECURITY HEADERS

**Core Principle:** Security headers are a free layer of browser-enforced protection. Always use them.

**Mandatory headers and values:**

**Content-Security-Policy (CSP):**
- Restricts which resources the browser will load
- Start strict: `default-src 'self'`
- Add only what you need: `script-src 'self'`, `style-src 'self' 'unsafe-inline'` (avoid unsafe-inline)
- Use nonces for inline scripts instead of `unsafe-inline`
- Test with `Content-Security-Policy-Report-Only` before enforcing
- Set up a `report-uri` to collect violations

**Strict-Transport-Security (HSTS):**
- `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`
- Forces HTTPS for the specified duration
- Submit to the HSTS preload list for maximum protection

**X-Frame-Options:**
- `X-Frame-Options: DENY` — prevents your site from being embedded in iframes (clickjacking protection)
- Or use CSP `frame-ancestors 'none'` for more control

**X-Content-Type-Options:**
- `X-Content-Type-Options: nosniff`
- Prevents browsers from MIME-sniffing responses

**Referrer-Policy:**
- `Referrer-Policy: strict-origin-when-cross-origin`
- Controls how much referrer information is included with requests

**Permissions-Policy:**
- Disable browser features you don't use:
- `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()`

**Remove:**
- `X-Powered-By` — reveals your tech stack to attackers
- Server version headers from nginx/Apache configs

**Implementation:**
- Use Helmet.js in Express/Node
- Configure in nginx or Cloudflare for non-Node stacks
- Verify with securityheaders.com

---

# RULE 12: FILE UPLOAD SECURITY

**Core Principle:** An uploaded file is an attack vector. Never trust it.

**Validation:**
- Check MIME type server-side — read the file magic bytes, don't trust the `Content-Type` header
- Validate the file extension against an allowlist
- Both must match: a `.jpg` with a PDF magic byte should be rejected
- Set hard size limits per file and per upload session
- Reject zero-byte files

**Storage:**
- Never store uploads in your web root or anywhere they can be directly executed
- Never serve uploaded files with executable permissions
- Rename every upload to a UUID on the server — discard the original filename entirely
- Store original filename (sanitized) only in the database for display purposes
- Preferred: store uploads in S3 / GCS / Azure Blob with no public execute permission
- Serve via a signed URL or a controlled streaming endpoint, not direct file URLs

**Content safety:**
- For sensitive applications: scan uploads with an antivirus API (ClamAV, VirusTotal API)
- For image uploads: re-encode images with Sharp or similar to strip EXIF data and neutralize polyglot files
- For document uploads: be especially careful — Office documents can contain macros

**Allowlist examples:**
- Images only: `['image/jpeg', 'image/png', 'image/webp', 'image/gif']`
- Documents: `['application/pdf']` (safest — avoid Office formats unless necessary)
- Never allow: `.exe`, `.sh`, `.php`, `.js`, `.html`, `.svg` (SVGs can contain scripts)

---

# RULE 13: XSS PREVENTION

**Core Principle:** XSS lets attackers run their code in your users' browsers. It is trivially weaponized.

**What XSS can do:**
- Steal session cookies (even HttpOnly cookies via CSRF chaining)
- Exfiltrate data the user can see
- Perform actions on behalf of the user
- Redirect users to phishing pages
- Inject keyloggers

**Prevention:**
- React, Vue, Angular escape dynamic content by default — don't bypass this
- Never use `dangerouslySetInnerHTML` unless absolutely necessary
- If you must use it, sanitize the HTML with DOMPurify first, every single time
- Never use `innerHTML` with dynamic content in vanilla JavaScript
- Never use `eval()` with user-provided strings
- Never use `new Function()` with user-provided strings
- Never use `setTimeout(string)` or `setInterval(string)` — use function references

**Stored XSS (most dangerous):**
- Sanitize user-generated content before storing AND before rendering
- Rich text editors (Quill, TipTap, ProseMirror): sanitize the output before saving to DB
- Sanitize again when rendering — defense in depth

**CSP as a second line of defense:**
- A well-configured CSP will block most XSS execution even if injection occurs
- This is why CSP matters — it's your safety net

---

# RULE 14: ERROR HANDLING AND LOGGING

**Core Principle:** Errors are information. Give attackers none of it. Give your team all of it.

**Client-facing errors:**
- Generic messages only: "Something went wrong", "Request failed", "Not found"
- Never expose: stack traces, file paths, database queries, internal service names, error codes that reveal architecture
- Map specific internal errors to appropriate HTTP status codes and generic messages
- For validation errors: specific field-level messages are fine ("Email is required") — these don't reveal internals

**Server-side logging:**
- Log the full error: stack trace, context, request details
- Use structured logging (JSON format) for log aggregation
- Every log entry should include: timestamp (ISO 8601), user ID (if authenticated), request ID, IP address, route, HTTP method, sanitized request metadata, error details
- Centralize logs: Sentry (errors), Datadog, Logtail, Axiom, Grafana Loki

**What not to log:**
- Passwords, tokens, session IDs
- Full request bodies when they may contain sensitive data (log selectively, strip sensitive fields)
- Credit card numbers, SSNs, health data
- Implement a field-level log scrubber for sensitive keys

**Error monitoring:**
- Set up Sentry or equivalent from day one, not after you hit production issues
- Configure alerts for error rate spikes
- Group and deduplicate errors
- Track error rates per route and per user segment

**Request IDs:**
- Generate a unique request ID for every incoming request
- Include it in response headers: `X-Request-ID`
- Include it in all log entries for that request
- Allows you to trace a user-reported issue through your entire log system

---

# RULE 15: AUDIT LOGGING AND MONITORING

**Core Principle:** You cannot detect an attack you're not watching for. You cannot investigate an incident without logs.

**What must be audit logged:**
- All login attempts (success and failure) with IP, user agent, timestamp
- All logout events
- All password change and reset events
- All email change events
- All MFA enable/disable events
- All permission and role changes
- All admin actions (what action, who did it, when, what was affected)
- All payment events (initiation, success, failure, refund, dispute)
- All data export requests
- All account deletion requests
- All failed authorization attempts (user X tried to access resource Y and was denied)
- All API key creation, rotation, deletion
- All suspicious activity detections

**Audit log requirements:**
- Append-only: audit logs must not be editable or deletable by the application
- Separate storage from application logs
- Include: event type, actor (user ID, IP), target (resource type + ID), timestamp, outcome, metadata
- Retain for minimum 1 year, longer for regulated industries
- Protect audit log access — only compliance/security team should have access

**Monitoring and alerting:**
- Alert on: unusual login volume, logins from new geographies, mass failed auth attempts, abnormal API usage, unusual data export volume, privilege escalation
- Define baselines and alert on deviations
- Implement anomaly detection for AI/LLM usage — abnormal token usage could mean a prompt injection attack or cost abuse

---

# RULE 16: DEPENDENCY SECURITY

**Core Principle:** Every package you install is code you're running in production. Review it accordingly.

**Before adding a dependency ask:**
- Is it actively maintained? (last commit, open issues, response to bug reports)
- Is it widely used and trusted? (download count, GitHub stars, major users)
- Does it have known vulnerabilities? (check npm advisory, Snyk, OSV.dev)
- Does it do more than I need? (prefer small, focused packages)
- Can I implement this myself in 10 lines? (if yes, don't add a dependency)

**Lockfiles:**
- Always commit `package-lock.json` or `yarn.lock` or `pnpm-lock.yaml`
- Lockfiles ensure deterministic installs — same code on every machine and in CI
- Never delete and regenerate a lockfile without carefully reviewing the diff

**Version pinning:**
- Pin to exact versions in production (`"express": "4.18.2"` not `"^4.18.2"`)
- Use `npm ci` instead of `npm install` in CI — installs exactly what's in the lockfile
- Automate dependency updates with Dependabot or Renovate, but review each update

**Regular audits:**
- Run `npm audit` or `pnpm audit` before every deploy
- Run `pip-audit` for Python projects
- Treat high and critical vulnerabilities as release blockers
- Set a policy: no deploy with known critical CVEs in dependencies

**Install scripts:**
- Be cautious of packages with `postinstall` scripts
- Review install scripts before running them
- Use `npm install --ignore-scripts` when possible and only run known-safe scripts

---

# RULE 17: CI/CD PIPELINE SECURITY

**Core Principle:** Your deployment pipeline has as much power as your production environment. Secure it like it.

**Secrets in CI/CD:**
- Never hardcode secrets in workflow files, Dockerfiles, or build scripts
- Store secrets in your CI/CD platform's secret store (GitHub Actions Secrets, GitLab CI Variables)
- Secrets should not be printed in logs — mask them in CI settings
- Use OIDC (OpenID Connect) for cloud provider authentication from CI — eliminates long-lived static credentials

**Pipeline requirements:**
- Every push to main/production branch runs: linting, type checking, unit tests, integration tests, security scans, secret detection
- Use tools like `git-secrets`, `truffleHog`, `gitleaks` to scan for accidentally committed secrets
- Run `npm audit` / `pip-audit` as a required CI step
- Run SAST (Static Application Security Testing): Semgrep, CodeQL, Bandit (Python)
- Block merges to protected branches on failing checks

**Deployment controls:**
- Protected branches: require pull request review before merging to main
- Require a minimum of 1–2 approvals for production deployments
- Separate deployment environments: development, staging, production
- Staging must mirror production configuration
- Production deploys should require explicit approval, not auto-deploy on every merge

**Infrastructure as Code:**
- Version control all infrastructure (Terraform, Pulumi, CloudFormation)
- Treat IaC changes with same review rigor as application code
- Use `terraform plan` to review changes before `terraform apply`
- Never run `terraform apply` directly in production without plan review

---

# RULE 18: BACKUPS AND DISASTER RECOVERY

**Core Principle:** You will have an incident. Prepare for it now.

**Backup requirements:**
- Automated database backups: hourly for critical data, daily minimum for all data
- Backups stored in a separate account, region, or cloud provider from production
- Backups encrypted at rest with separate key management
- Retain backups: 7 daily, 4 weekly, 12 monthly — adjust for compliance requirements
- Point-in-time recovery (PITR) enabled on all production databases

**Testing:**
- Restore from backup at least monthly in a non-production environment
- Document the restore procedure — if it's not written down, it won't be followed in a crisis
- Time the restore — know how long it takes so you can set accurate RTO expectations
- Test application functionality after restore

**Disaster recovery planning:**
- Define RTO (Recovery Time Objective): how long can you be down?
- Define RPO (Recovery Point Objective): how much data can you lose?
- Write a runbook for each failure scenario:
  - Database corruption or accidental deletion
  - Credentials compromised
  - Cloud region outage
  - Ransomware attack
  - Accidental mass delete
- Runbooks should be stored outside your primary infrastructure (not on servers that might be compromised)

---

# RULE 19: ZERO TRUST INTERNAL SECURITY

**Core Principle:** Being inside the network doesn't make you trusted. Verify everything.

**Service-to-service communication:**
- Internal API calls must be authenticated — use service tokens, mTLS, or OIDC
- Never assume a request is safe because it came from an internal IP
- Validate all inputs even from internal services — a compromised internal service is an attack vector
- Use network policies to restrict which services can talk to which

**Principle of least privilege for services:**
- Each microservice has its own database credentials with access only to its own tables
- Each service has only the cloud permissions it needs — no wildcard IAM policies
- Secret access: each service can only read its own secrets, not secrets for other services

**Developer access:**
- Require VPN or Zero Trust Network Access (ZTNA) like Tailscale or Cloudflare Access for internal tools
- Require MFA for all developer access to production
- Use just-in-time access for production database access — elevated access is temporary, logged, and revoked
- No permanent root or admin database access for developers

---

# RULE 20: AI AND LLM SECURITY

**Core Principle:** LLMs are powerful, expensive, and easily abused. Treat them like a privileged resource.

**API key protection:**
- LLM API keys (Anthropic, OpenAI, etc.) must never appear in frontend code, browser, or mobile app
- All LLM API calls must be proxied through your backend
- The backend validates the user is authenticated, authorized, and within quota before calling the LLM API
- Separate API keys per environment (dev, staging, production)
- Set spend limits on LLM API accounts

**Rate limiting and quotas:**
- Per-user token limits per day/month to prevent cost abuse
- Per-user request limits per minute (see Rule 6)
- Hard stop when quota is exhausted — return clear error, don't silently continue
- Track and log token usage per user, per request

**Prompt injection protection:**
- User input passed to an LLM must be treated as untrusted, just like SQL input
- Clearly separate system instructions from user input in your prompts
- Use structured prompt formats, not string concatenation of user input into system prompts
- Validate and sanitize user input before including in prompts
- Implement output validation — if the model ignores instructions and returns something unexpected, handle it

**Output safety:**
- Validate LLM output before using it — don't assume the model followed instructions
- Never execute LLM-generated code without sandboxing and human review
- Never render raw LLM-generated HTML — sanitize with DOMPurify first
- Never use LLM output directly in database queries or shell commands

**Cost abuse detection:**
- Monitor for abnormal token usage patterns
- Alert when a single user's usage exceeds a threshold
- Implement CAPTCHA or additional verification for high-token operations
- Log all LLM calls: user ID, timestamp, token count (input + output), model, endpoint

**Agentic AI systems (AI that takes actions):**
- Every action an agent takes must be explicitly permitted in its scope definition
- Agents must not be able to escalate their own permissions
- Implement a human-in-the-loop checkpoint for irreversible actions (deletions, payments, emails)
- Log every action an agent takes with full context

---

# RULE 21: PRIVACY AND DATA MINIMIZATION

**Core Principle:** Data you don't collect can't be breached. Data you do collect is your responsibility.

**Data collection:**
- Only collect data that has a specific, documented purpose
- Ask yourself before adding any data collection: "What feature breaks if we don't have this?"
- Do not collect data "just in case" or "for future use"
- PII fields require extra justification: SSN, date of birth, phone number, precise location

**Storage and retention:**
- Define retention policies for every data type and enforce them automatically
- Anonymize or delete user data after the retention period expires
- Soft-delete records (mark as deleted) but also schedule hard deletes for PII
- Never retain payment card data unless you are fully PCI-DSS compliant

**User rights (required in GDPR regions, best practice everywhere):**
- Data export: users can download all data you hold about them
- Account deletion: users can delete their account and data — fully, not just deactivating
- Data correction: users can update incorrect personal data
- Consent withdrawal: if you use consent as a legal basis, users can withdraw it

**Compliance considerations:**
- GDPR (EU): lawful basis for processing, data subject rights, DPA agreements, breach notification within 72 hours
- CCPA (California): right to know, right to delete, right to opt out of sale
- HIPAA (US health data): extensive technical, physical, administrative safeguards required
- PCI-DSS (payment card data): if you store/process/transmit card data
- If any of these apply, consult a specialist — fines are severe

---

# RULE 22: INFRASTRUCTURE AND SCALABILITY

**Core Principle:** Build for the traffic you'll have in a year, not the traffic you have today.

**Stateless architecture:**
- Application servers must be stateless — session state lives in Redis or the database, not in server memory
- Any server can handle any request — horizontal scaling requires this
- Use environment variables for all configuration — no hardcoded endpoints or hostnames

**Caching:**
- Cache expensive database queries with Redis (or Memcached)
- Cache at the right level: full page, API response, database query result
- Set appropriate TTLs — stale data can be as dangerous as missing data
- Use cache invalidation strategies: TTL, event-driven invalidation, cache-aside pattern
- CDN for static assets: images, JS bundles, CSS — never origin-serve these

**Database scalability:**
- Use connection pooling (PgBouncer for PostgreSQL) — don't open a new connection per request
- Read replicas for read-heavy workloads
- Indexes on all columns used in WHERE clauses, JOINs, and ORDER BY
- Monitor slow queries and optimize before they become production incidents
- Partition large tables (time-series data, logs, events)

**Queue-based architecture:**
- Long-running operations (email sending, PDF generation, AI processing, image resizing) must be offloaded to a job queue
- Never do heavy work synchronously in a request handler — it blocks the server and times out
- Use: BullMQ (Node.js), Celery (Python), Sidekiq (Ruby), RQ
- Implement dead letter queues for failed jobs
- Retry with exponential backoff on transient failures

**Health and resilience:**
- Implement `/health` and `/ready` endpoints — used by load balancers and orchestrators
- Circuit breakers for external service calls — fail fast if a dependency is down
- Graceful shutdown — drain in-flight requests before stopping a server
- Multi-AZ / multi-region deployment for critical applications
- Load balancer in front of multiple application instances — no single point of failure

---

# RULE 23: CODE QUALITY STANDARDS

**Core Principle:** Unmaintainable code becomes insecure code. Maintainability is a security property.

**Typing:**
- Use TypeScript in all JavaScript/Node.js projects — `strict: true` in `tsconfig.json`
- Type all function parameters and return values explicitly
- Never use `any` — use `unknown` and narrow, or define proper types
- Use Pydantic in Python for typed data models

**Modularity:**
- Single Responsibility Principle: each file, function, and module does one thing
- Maximum file size: ~300 lines is a soft ceiling; 500+ is a refactor signal
- Separate concerns: routing, business logic, data access, external services in separate layers
- Co-locate related logic; separate unrelated logic

**Naming:**
- Variables, functions, and classes should be self-documenting
- `getUserByEmail()` not `getU()` or `fetch()`
- Avoid abbreviations unless they are universally understood (`req`, `res`, `err` are fine; `usrEmNm` is not)
- Boolean variables and functions: use `is`, `has`, `can`, `should` prefixes

**Documentation:**
- JSDoc / docstrings on all public functions and classes
- README for every service: what it does, how to run it locally, environment variables required, how to deploy
- Architecture decision records (ADRs) for significant technical choices
- Comment the "why" not the "what" — code shows what, comments explain why

**No magic numbers or strings:**
- Extract constants to named variables: `MAX_LOGIN_ATTEMPTS = 5` not just `5` inline
- Use enums for fixed sets of values
- Configuration values in environment variables, not inline

**Testing:**
- Unit tests for all business logic
- Integration tests for all API endpoints
- Test coverage target: 80%+ for critical paths
- Tests must run in CI — no merging code with failing tests
- Test the unhappy paths — invalid input, auth failures, not found — not just the happy path

---

# RULE 24: PRODUCTION DEPLOYMENT CHECKLIST

**Every production deployment must verify all of the following:**

**Secrets and configuration:**
- [ ] No secrets committed to version control
- [ ] `.env` files are in `.gitignore` and not tracked
- [ ] All environment variables are set in the deployment environment
- [ ] No hardcoded credentials anywhere in the codebase

**Security:**
- [ ] HTTPS enforced, HSTS configured
- [ ] Rate limiting active on all public endpoints
- [ ] CORS allowlist is correct and does not include `*`
- [ ] Security headers configured (run securityheaders.com check)
- [ ] Debug mode and verbose errors are disabled
- [ ] No development dependencies shipped to production
- [ ] `npm audit` / `pip-audit` passed with no critical CVEs

**Auth and access:**
- [ ] Authentication verified on all protected routes
- [ ] Authorization verified on all sensitive actions
- [ ] Admin routes are restricted
- [ ] Session expiry is configured

**Data:**
- [ ] Database backups are running and verified
- [ ] No sensitive data in logs
- [ ] PII handling complies with applicable regulations

**Observability:**
- [ ] Error monitoring active (Sentry or equivalent)
- [ ] Logging configured and shipping to central system
- [ ] Health check endpoints returning 200
- [ ] Alerts configured for critical error rates

**AI/LLM (if applicable):**
- [ ] LLM API keys are server-side only
- [ ] Per-user token quotas configured
- [ ] Rate limiting on AI endpoints active
- [ ] Spend limit set on LLM API account
- [ ] Output validation in place

**Infrastructure:**
- [ ] Unused routes and endpoints removed
- [ ] Old API versions deprecated or removed
- [ ] CDN configured for static assets
- [ ] Connection pooling configured for database

---

# FINAL PRINCIPLE

Security is not a feature. Reliability is not a feature. Maintainability is not a feature. These are the baseline cost of putting software in front of real users. Every shortcut taken here is a debt that will be repaid — usually at the worst possible moment, at scale, under pressure. Build it right from the start.

---