# CAAI – Combat Antisemitism with AI
# Full Project Roadmap & Implementation Plan

**Project Name**: Combat Antisemitism with AI Tool (ACT)
**Domain**: combatantisemitismwithai.com
**Organization**: CAAI

---

## Table of Contents

1. [Phase 1 – Foundation & Production Launch](#phase-1--foundation--production-launch)
2. [Phase 2 – Advanced Detection & Analytics](#phase-2--advanced-detection--analytics)
3. [Phase 3 – Platform Expansion & Automation](#phase-3--platform-expansion--automation)
4. [Phase 4 – Community, Education & Mobile](#phase-4--community-education--mobile)
5. [Phase 5 – Scale, Enterprise & Ecosystem](#phase-5--scale-enterprise--ecosystem)
6. [Architecture Evolution](#architecture-evolution)
7. [Risk Register](#risk-register)

---

## Phase 1 – Foundation & Production Launch

**Timeline**: 31 days (including testing and deployment)
**Primary Goal**: Move the prototype to the CAAI website, implement registration with admin control, and prepare the ACT for reliable production use.

### Milestone 1: Infrastructure Setup (Days 1–7)

| Task | Description | Status |
|------|-------------|--------|
| DigitalOcean provisioning | Provision droplet, configure firewall, SSH keys, fail2ban | Pending |
| DNS configuration | Point GoDaddy domain to DigitalOcean via A records | Pending |
| SSL/HTTPS | Install Certbot, obtain Let's Encrypt certificates | Done (config ready) |
| Docker deployment | Deploy backend + nginx via docker-compose | Done (config ready) |
| Environment secrets | Configure .env files, secure secrets handling | Pending |
| n8n connectivity | Verify webhook connectivity from production server | Pending |
| CI/CD pipeline | Set up GitHub Actions or manual deploy script | Pending |
| Application boot verification | End-to-end smoke test on production | Pending |

### Milestone 2: Development Phase 1 – Core Features (Days 8–18)

| Task | Description | Status |
|------|-------------|--------|
| ACT migration | Deploy ACT tool on production domain | Pending |
| Homepage anonymity | Remove/replace personal identifiers, images, names | Done |
| Registration page | Name + email form, JWT cookie auth | Done |
| Registration flow | Unregistered users redirected to /register, then to /detect | Done |
| User database | Supabase users table with secure storage | Done |
| Admin panel | View, search, filter, paginate users | Done |
| Admin user CRUD | Create, suspend, reactivate, delete users | Done |
| Admin login | Supabase Auth + admin_users table verification | Done |
| Admin login link | Footer link to /admin/login | Done |
| Admin password change | In-app current → new password flow | Done |
| Backend API | /api/auth, /api/act, /api/admin, /api/health | Done |

### Milestone 3: Development Phase 2 – Optimization & QA (Days 19–28)

| Task | Description | Status |
|------|-------------|--------|
| Rate limiting | Configurable submission limits per time window | Done |
| Admin rate config | In-app settings panel (no redeploy needed) | Done |
| Whitelist/exceptions | Admin and designated users bypass limits | Done |
| Rate limit UX | User-facing message with remaining wait time | Done |
| Output formatting | Markdown rendering for AI responses | Done |
| IHRA optimization | Tune n8n prompts for IHRA-aligned classification | Done (prompt ready) |
| False negative reduction | Improve detection sensitivity with IHRA rules | Done (prompt ready) |
| Image symbol detection | Enhanced visual antisemitism recognition | Done (prompt ready) |
| Machine-readable output | Structured format for UI parsing | Done |
| Video detection (bonus) | Basic video upload, frame sampling, classification | Done |

### Milestone 4: Testing, Deployment & Handoff (Days 29–31)

| Task | Description | Status |
|------|-------------|--------|
| E2E testing – registration | Test full registration and access flow | Done (11 tests) |
| E2E testing – admin panel | Test all CRUD operations, search, filter | Done (15 tests) |
| E2E testing – rate limiting | Test limits, whitelist bypass, user messaging | Done (4 tests) |
| E2E testing – ACT submissions | Test text, image, (video) analysis | Done (9 tests) |
| Edge-case testing | Classification accuracy, formatting consistency | Pending |
| Production deployment | Final deploy and DNS verification | Pending |
| Live walkthrough | Demo final system to client | Pending |
| Code delivery | Progressive commits to client GitHub repository | Pending |
| Handover documentation | System architecture, deployment guide, admin guide | Pending |

### Phase 1 Deliverables Summary
- Production-deployed ACT on combatantisemitismwithai.com
- User registration with admin control
- Configurable abuse prevention
- Optimized text + image detection (IHRA-aligned)
- Admin dashboard with full user management
- SSL/HTTPS secure hosting on DigitalOcean
- 30-day post-launch support

---

## Phase 2 – Advanced Detection & Analytics

**Estimated Timeline**: 6–8 weeks
**Primary Goal**: Deepen detection intelligence, add analytics, and mature the video module.

### 2.1 Multi-Language Detection

| Task | Description | Priority |
|------|-------------|----------|
| Language detection | Auto-detect input language before analysis | High |
| Multi-language prompts | IHRA-aligned prompts for Hebrew, Arabic, French, German, Spanish | High |
| RTL support | Right-to-left text rendering for Hebrew/Arabic | High |
| Translation layer | Translate non-English content for analysis pipeline | Medium |
| Language-specific symbols | Region-specific antisemitic imagery databases | Medium |

### 2.2 Classification Depth

| Task | Description | Priority |
|------|-------------|----------|
| IHRA category tagging | Label results by IHRA category (Holocaust denial, conspiracy, delegitimization, etc.) | High |
| Confidence scoring | Percentage-based confidence for each classification | High |
| Severity levels | Low / Medium / High / Critical severity rating | High |
| Evidence highlighting | Highlight specific phrases/regions that triggered detection | Medium |
| False positive feedback | User "report incorrect" button to improve model | Medium |

### 2.3 Analytics Dashboard (Admin)

| Task | Description | Priority |
|------|-------------|----------|
| Submission statistics | Total submissions, daily/weekly/monthly trends | High |
| Detection breakdown | Pie/bar charts by IHRA category | High |
| User activity | Most active users, submission frequency | Medium |
| Accuracy metrics | False positive/negative rates (from feedback) | Medium |
| Export reports | CSV/PDF export of analytics data | Medium |
| Time-series trends | Track antisemitism trends over time | Low |

### 2.4 Video Detection (Full)

| Task | Description | Priority |
|------|-------------|----------|
| Video upload UI | Drag-and-drop video upload with progress bar | High |
| Format support | MP4, MOV, AVI, WebM | High |
| Frame extraction | Server-side frame sampling (FFmpeg) | High |
| Audio transcription | Extract and transcribe speech (Whisper API) | High |
| Frame analysis | Analyze sampled frames for antisemitic imagery | High |
| Combined report | Unified report combining visual + audio analysis | Medium |
| Timestamp markers | Flag specific timestamps where content was detected | Medium |
| Duration limits | Configurable max video length (admin setting) | Low |

### 2.5 User History & Reports

| Task | Description | Priority |
|------|-------------|----------|
| Submission history | Users can view past analyses | High |
| Saved reports | Download/re-download previous PDF reports | Medium |
| Session continuity | Resume previous analysis sessions | Low |
| Bookmarking | Save important analyses for reference | Low |

### Phase 2 Deliverables
- Multi-language antisemitism detection (5+ languages)
- IHRA category classification with confidence scores
- Admin analytics dashboard with trends and exports
- Full video analysis (visual + audio)
- User submission history

---

## Phase 3 – Platform Expansion & Automation

**Estimated Timeline**: 8–10 weeks
**Primary Goal**: Transform ACT from a tool into an automated monitoring platform.

### 3.1 Judah's Hammer Bot

| Task | Description | Priority |
|------|-------------|----------|
| Counter-narrative engine | AI-generated responses to antisemitic content | High |
| Tone configuration | Professional, educational, assertive response styles | High |
| Template library | Pre-approved response templates by category | Medium |
| Human review queue | Admin approval before auto-posting | High |
| Response effectiveness tracking | Measure engagement/impact of counter-narratives | Medium |

### 3.2 Browser Extension

| Task | Description | Priority |
|------|-------------|----------|
| Chrome extension | Real-time page scanning for antisemitic content | High |
| Firefox extension | Cross-browser support | Medium |
| Highlight mode | Overlay highlighting flagged content on web pages | High |
| Right-click analysis | Select text → analyze via context menu | High |
| Notification badges | Badge count of detected items per page | Medium |
| Extension settings | Sensitivity controls, whitelist domains | Medium |
| Sync with platform | Push findings to user's CAAI dashboard | Low |

### 3.3 Multi-Platform Monitoring

| Task | Description | Priority |
|------|-------------|----------|
| Social media connectors | Twitter/X, Reddit, Telegram, Facebook APIs | High |
| Keyword monitoring | Configurable keyword/phrase watchlists | High |
| Scheduled scanning | Cron-based periodic content scanning | High |
| Alert system | Email/SMS/webhook alerts on detection | High |
| Dashboard feed | Real-time feed of flagged content | Medium |
| Geolocation tagging | Map detected content by origin | Low |
| Trend correlation | Correlate spikes with real-world events | Low |

### 3.4 Public API

| Task | Description | Priority |
|------|-------------|----------|
| REST API design | Versioned API (v1) with OpenAPI spec | High |
| Authentication | API key management, OAuth2 | High |
| Rate limiting (API) | Tiered limits by plan (free/pro/enterprise) | High |
| Text analysis endpoint | POST /api/v1/analyze/text | High |
| Image analysis endpoint | POST /api/v1/analyze/image | High |
| Video analysis endpoint | POST /api/v1/analyze/video | Medium |
| Batch analysis | Bulk submission endpoint | Medium |
| Webhook callbacks | Async results via webhook | Medium |
| API documentation | Interactive docs (Swagger UI) | High |
| SDKs | Python, JavaScript, and cURL examples | Low |

### 3.5 Notification & Alert System

| Task | Description | Priority |
|------|-------------|----------|
| Email notifications | Alerts for high-severity detections | High |
| Webhook integration | Push alerts to Slack, Discord, custom endpoints | Medium |
| SMS alerts | Critical alert SMS via Twilio | Low |
| Digest reports | Daily/weekly email summaries | Medium |
| Alert rules | Configurable trigger conditions | Medium |

### Phase 3 Deliverables
- Judah's Hammer counter-narrative bot
- Chrome/Firefox browser extension
- Multi-platform social media monitoring
- Public REST API with documentation
- Alert and notification system

---

## Phase 4 – Community, Education & Mobile

**Estimated Timeline**: 8–10 weeks
**Primary Goal**: Scale impact through community engagement, educational resources, and mobile access.

### 4.1 Mobile Applications

| Task | Description | Priority |
|------|-------------|----------|
| React Native setup | Cross-platform iOS/Android from shared codebase | High |
| Text analysis | Mobile text input and analysis | High |
| Camera integration | Take photo → analyze for antisemitic content | High |
| Video capture | Record or upload video for analysis | Medium |
| Push notifications | Alert on monitoring results | High |
| Offline mode | Cache recent results for offline viewing | Low |
| App Store deployment | iOS App Store and Google Play submission | High |

### 4.2 Community Platform

| Task | Description | Priority |
|------|-------------|----------|
| Discussion forums | Threaded discussions by topic/category | High |
| Resource sharing | Upload and share research, articles, guides | Medium |
| Expert directory | Directory of researchers, educators, advocates | Medium |
| Event calendar | Community events, webinars, conferences | Low |
| Moderation tools | Content moderation for community posts | High |
| User profiles | Public profiles with activity history | Medium |

### 4.3 Educational Resource Generation

| Task | Description | Priority |
|------|-------------|----------|
| AI-generated guides | Training materials on recognizing antisemitism | High |
| Case study library | Real-world examples with analysis | High |
| Quiz/assessment tools | Interactive learning modules | Medium |
| Educator toolkit | Classroom-ready materials and lesson plans | Medium |
| Multi-format export | PDF, PowerPoint, video format resources | Low |
| Localized content | Educational materials in multiple languages | Medium |

### 4.4 Institutional Tools

| Task | Description | Priority |
|------|-------------|----------|
| Organization accounts | Multi-user accounts for institutions | High |
| Custom dashboards | Tailored views for universities, synagogues, NGOs | High |
| Threat monitoring | Location-specific monitoring for institutions | Medium |
| Incident reporting | Structured incident report generation | Medium |
| Integration with authorities | Export reports for law enforcement | Low |
| Benchmarking | Compare institution metrics against baselines | Low |

### Phase 4 Deliverables
- Native iOS and Android mobile apps
- Community forum and resource sharing platform
- AI-generated educational materials
- Institutional dashboards and threat monitoring

---

## Phase 5 – Scale, Enterprise & Ecosystem

**Estimated Timeline**: 10–12 weeks
**Primary Goal**: Enterprise-grade infrastructure, partnerships, and ecosystem growth.

### 5.1 Enterprise Features

| Task | Description | Priority |
|------|-------------|----------|
| Multi-tenant architecture | Isolated instances per organization | High |
| Role-based access (RBAC) | Granular permissions (admin, analyst, viewer) | High |
| SSO/SAML integration | Enterprise single sign-on | High |
| Audit logging | Complete action audit trail | High |
| SLA management | Uptime guarantees and monitoring | Medium |
| Custom branding | White-label option for partners | Low |

### 5.2 Advanced Analytics & AI

| Task | Description | Priority |
|------|-------------|----------|
| Predictive analytics | Forecast antisemitism trends | High |
| Geographic heat maps | Visualize global distribution of content | High |
| Network analysis | Map connections between antisemitic actors | Medium |
| Custom model fine-tuning | Organization-specific detection models | Medium |
| Sentiment evolution | Track how narratives evolve over time | Medium |
| Research export | Datasets for academic research (anonymized) | Low |

### 5.3 Infrastructure & Scale

| Task | Description | Priority |
|------|-------------|----------|
| Kubernetes migration | Container orchestration for auto-scaling | High |
| Multi-region deployment | US, EU, IL data centers | High |
| CDN integration | Global content delivery for static assets | Medium |
| Database sharding | Horizontal scaling for high-volume data | Medium |
| Queue system | Redis/RabbitMQ for async processing | High |
| Monitoring & observability | Datadog/Grafana dashboards, alerting | High |
| Disaster recovery | Automated backups, failover, RTO/RPO targets | High |

### 5.4 Compliance & Governance

| Task | Description | Priority |
|------|-------------|----------|
| GDPR compliance | Data processing agreements, right to erasure | High |
| SOC 2 preparation | Security controls documentation | Medium |
| Data retention policies | Configurable retention and purge rules | High |
| Privacy controls | User data export, deletion requests | High |
| Terms of service | Legal framework for API and platform usage | Medium |
| Accessibility (WCAG) | AA compliance across all interfaces | Medium |

### 5.5 Ecosystem & Partnerships

| Task | Description | Priority |
|------|-------------|----------|
| Partner API program | Onboard third-party integrators | Medium |
| Marketplace | Community-built plugins and extensions | Low |
| Academic partnerships | Research collaboration framework | Medium |
| NGO integrations | Direct feeds to ADL, Simon Wiesenthal, etc. | Medium |
| Social platform partnerships | Direct integration with content moderation teams | High |
| Government reporting | Standardized reporting for hate crime databases | Low |

### Phase 5 Deliverables
- Enterprise multi-tenant platform with RBAC and SSO
- Predictive analytics and geographic visualization
- Kubernetes-based auto-scaling infrastructure
- GDPR compliance and SOC 2 readiness
- Partner ecosystem and API marketplace

---

## Architecture Evolution

### Phase 1 (Current)
```
User → React SPA → Express API → n8n Webhook → OpenAI
                  → Supabase (auth + DB)
         Nginx (SSL/proxy) on DigitalOcean
```

### Phase 2–3 (Platform)
```
User → React SPA / Browser Extension / Mobile App
     → API Gateway (rate limiting, auth)
     → Express API (core services)
     → n8n Workflows (AI processing)
     → OpenAI / Whisper (text, image, video, audio)
     → Supabase (auth + DB)
     → Redis (caching, queues)
     → FFmpeg (video processing)
     → Monitoring (alerts, notifications)
```

### Phase 4–5 (Enterprise)
```
Users / Institutions / API Consumers / Mobile / Extensions
     → CDN (static assets)
     → Load Balancer
     → API Gateway (auth, rate limits, routing)
     → Kubernetes Cluster
         → Core API pods
         → AI Processing pods
         → Video Processing pods
         → Notification service
         → Analytics service
     → PostgreSQL (primary + replicas)
     → Redis Cluster (cache + queues)
     → Object Storage (media, reports)
     → Monitoring (Grafana, Datadog)
     → Multi-region failover
```

---

## Risk Register

| Risk | Impact | Mitigation |
|------|--------|------------|
| AI false positives damaging credibility | High | Human review queue, confidence thresholds, feedback loop |
| API cost overruns (OpenAI tokens) | High | Rate limiting, caching, prompt optimization, budget alerts |
| Social platform API restrictions | Medium | Multiple data sources, browser extension as fallback |
| Content moderation liability | Medium | Clear terms of service, human oversight, legal review |
| Data privacy regulations | Medium | GDPR compliance from Phase 2, data minimization |
| Scaling bottlenecks | Medium | Async processing, queue system, horizontal scaling |
| n8n workflow reliability | Medium | Health checks, retry logic, fallback workflows |
| Video processing costs/limits | Low | Duration limits, frame sampling optimization, queue management |

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-02-25 | Initial roadmap covering Phases 1–5 |

---

**Built to combat hate and promote understanding.**
