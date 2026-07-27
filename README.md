# CAAI - Combat Antisemitism with AI

A comprehensive AI-powered platform for detecting, analyzing, and combating antisemitic content online and offline.

## 🌟 Live Demo

Visit the live application: [https://www.combatantisemitismwithai.com](https://www.combatantisemitismwithai.com)

## 📋 Overview

CAAI (Combat Antisemitism with AI) leverages cutting-edge artificial intelligence technology to identify, analyze, and counter antisemitic content across digital platforms. Our mission is to create a more inclusive digital world by providing tools and resources to combat hate speech at scale.

## 🚀 Key Features

### 🔍 ACT (Antisemitism Checker Tool)
- **Text Analysis**: Paste or type text content for AI-powered antisemitism detection
- **Image Analysis**: Upload or drag-and-drop images (JPEG, PNG, BMP) for visual content analysis
- **Real-time Chat Interface**: Interactive conversation-style analysis with AI
- **PDF Export**: Generate detailed reports of analysis sessions with high-quality image preservation
- **Multi-format Support**: Accepts various text formats and image types
- **Paste Detection**: Automatically detects images pasted from clipboard

### 🌐 Platform Features
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Community Forum**: WhatsApp group for AI leaders, academics, and professionals
- **Educational Resources**: Comprehensive guides and examples for using AI tools
- **Email Registration**: Airtable-integrated signup system with duplicate detection
- **Modern UI/UX**: Gradient backgrounds, smooth animations, and intuitive navigation

### 🤖 AI Capabilities (Current & Planned)
- **Pattern Analysis**: Trend analysis in antisemitic rhetoric
- **Protective Monitoring**: Real-time digital space monitoring
- **Advanced Content Detection**: Multi-language antisemitism detection
- **Counter-Narrative Creation**: AI-generated responses to hate speech
- **Educational Resource Generation**: Grassroots community tools
- **Community Support**: Resources for affected institutions

## 🛠️ Technical Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for development and build tooling
- **Tailwind CSS** for styling and responsive design
- **React Router** for client-side routing
- **Lucide React** for iconography

### Backend & Services
- **Supabase** for database and authentication
- **N8N Webhook** for AI processing pipeline
- **Airtable API** for email signup management

### Key Libraries
- `react-modal` - Modal dialogs and overlays
- `jspdf` - PDF generation with image support
- `@supabase/supabase-js` - Supabase client integration

## 📂 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Button.tsx      # Styled button component
│   ├── Card.tsx        # Information card component
│   ├── Footer.tsx      # Site footer with links
│   ├── Header.tsx      # Navigation header
│   ├── JoinForm.tsx    # Email signup modal
│   ├── JoinModal.tsx   # Success confirmation modal
│   └── Logo.tsx        # CAAI branding logo
├── pages/              # Main application pages
│   ├── Detect.tsx      # ACT tool interface
│   ├── Home.tsx        # Landing page
│   ├── HowToUseACT.tsx # Tool usage instructions
│   └── Register.tsx    # Registration page
├── sections/           # Page sections
│   ├── CardSection.tsx # AI capabilities showcase
│   ├── Hero.tsx        # Landing hero section
│   ├── InfoSection.tsx # Mission and information
│   └── QuoteSection.tsx# Founder quote section
├── utils/              # Utility functions
│   └── imageUtils.ts   # Image compression utilities
├── lib/                # External service integrations
│   └── supabase.ts     # Supabase configuration
├── assets/             # Static assets
└── index.css           # Global styles and animations
```

## 🔧 Setup & Installation

### Prerequisites
- Node.js 18+ and npm
- Supabase account and project
- Airtable account and API key
- N8N webhook endpoint

### Environment Variables

Create a `.env` file with the following variables:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Airtable Configuration
VITE_AIRTABLE_API_KEY=your_airtable_pat_token
VITE_AIRTABLE_BASE_ID=your_airtable_base_id
VITE_AIRTABLE_TABLE_NAME=Email Signups
```

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd caai-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new Supabase project
   - Run the migration in `supabase/migrations/20250622153712_smooth_cherry.sql`
   - Copy your project URL and anon key to `.env`

4. **Configure Airtable**
   - Create a new Airtable base with an "Email Signups" table
   - Add an "Email" column (text type)
   - Generate a Personal Access Token (PAT)
   - Add configuration to `.env`

5. **Start development server**
   ```bash
   npm run dev
   ```

## 📊 Database Schema

### Supabase Tables

#### `email_signups`
- `id` (uuid) - Primary key
- `email` (text) - User email address (unique)
- `created_at` (timestamptz) - Signup timestamp
- `ip_address` (text) - Optional user IP
- `user_agent` (text) - Optional browser info

**Security**: Row Level Security (RLS) enabled with policies for public signups and authenticated admin access.

## 🔌 API Integrations

### N8N Webhook Integration
The ACT tool sends analysis requests to: `https://caai-project-development.app.n8n.cloud/webhook/Chat`

**Payload Structure**:
```javascript
// Text Analysis
[{
  action: 'sendMessage',
  sessionId: 'unique-session-id',
  chatInput: 'text to analyze'
}]

// Image Analysis
[{
  action: 'sendMessage',
  sessionId: 'unique-session-id',
  chatInput: 'analyze this image',
  files: [{
    fileName: 'image.jpg',
    fileSize: '1 MB',
    fileType: 'image',
    mimeType: 'image/jpeg',
    fileExtension: 'jpeg',
    binaryKey: 'base64-encoded-image'
  }]
}]
```

### Airtable Integration
- **Purpose**: Email signup management
- **Table**: "Email Signups" with "Email" column
- **Features**: Duplicate detection, automatic timestamp
- **Authentication**: Personal Access Token (PAT)

## 🎨 Styling & Design

### Design System
- **Primary Colors**: Blue gradients (#3B82F6 to #1E40AF)
- **Accent Color**: Orange border highlights (#ed7c30)
- **Background**: Dark gradients (#3a3838 to #252525)
- **Typography**: System fonts with responsive scaling
- **Spacing**: 8px grid system with Tailwind utilities

### Key Design Features
- **Responsive Breakpoints**: Mobile-first approach
- **Smooth Animations**: CSS transitions and hover effects
- **Accessible Design**: High contrast ratios and keyboard navigation
- **Modern UI**: Rounded corners, shadows, and gradient backgrounds

## 🖼️ Image Processing

### Compression Features
- **Automatic Compression**: Reduces file size for API transmission
- **Quality Control**: Configurable JPEG quality (default 60-70%)
- **Dimension Limits**: Max 800x600px for uploads
- **Format Support**: JPEG, PNG, BMP formats
- **Canvas-based**: Client-side processing for privacy

### PDF Export
- **High-Quality Images**: Original quality preserved in PDFs
- **Chat Formatting**: WhatsApp-style message bubbles
- **Responsive Layout**: Automatic page breaks and sizing
- **Branding**: CAAI header and footer with timestamps

## 🔐 Security Features

- **Row Level Security**: Supabase RLS for data protection
- **Input Validation**: Email format and required field validation
- **Error Handling**: Comprehensive error messages and fallbacks
- **API Security**: Environment variable protection
- **Image Sanitization**: File type validation and compression

## 📱 Mobile Optimization

- **Touch-Friendly**: Large tap targets and gesture support
- **Responsive Text**: Fluid typography with clamp() functions
- **Mobile Navigation**: Collapsible hamburger menu
- **Drag & Drop**: Mobile-compatible file upload
- **Performance**: Optimized images and lazy loading

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deployment Platforms
- **Vercel**: Frontend hosting (current deployment)
- **Render**: Backend/API hosting (current deployment)
- **Custom Domain**: Configurable through hosting provider

## 🤝 Contributing

### Getting Started
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Code Style
- **TypeScript**: Strict type checking enabled
- **ESLint**: Code linting with React rules
- **Prettier**: Code formatting (recommended)
- **Component Structure**: Functional components with hooks

## 📞 Support & Contact

- **Email**: jmyers31@gmail.com
- **WhatsApp Forum**: [Join the CAAI Community](https://chat.whatsapp.com/GKHHEgY1NvI2xBA7PxLEyC)
- **Website**: [https://www.combatantisemitismwithai.com](https://www.combatantisemitismwithai.com)

## 📄 License

Copyright © Combat Antisemitism with AI, 2025. All rights reserved.

## 🔮 Future Development

### Planned Features
- **Judah's Hammer Bot**: Automated response system for antisemitic content
- **Multi-language Support**: Detection in multiple national languages
- **Advanced Analytics**: Detailed reporting and trend analysis
- **Browser Extension**: Real-time detection while browsing
- **Mobile App**: Native iOS and Android applications
- **API Access**: Public API for third-party integrations

### Roadmap
- Q1 2025: Enhanced detection algorithms
- Q2 2025: Multi-platform monitoring
- Q3 2025: Educational resource expansion
- Q4 2025: Community platform launch

---

**Built with ❤️ to combat hate and promote understanding**
