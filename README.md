# Gamava E-commerce Platform

## 🎮 Overview

Gamava is a modern, full-stack e-commerce platform specialized in digital gaming products, built with Next.js and PostgreSQL. The application serves as a comprehensive marketplace for digital game keys, software, and gaming accessories with integrated payment processing through Stripe and product data management capabilities.

## 🚀 Features

### Core E-commerce Features
- **Product Management**: Comprehensive product catalog with categories, filtering, and advanced search
- **Shopping Cart**: Client-side cart management with localStorage persistence  
- **Wishlist System**: Database-backed wishlist with guest session support
- **User Authentication**: Session-based auth with secure cookie management
- **Payment Processing**: Stripe integration with comprehensive European payment methods
- **Order Management**: Complete order tracking and confirmation system

### Advanced Features
- **Admin Panel**: Full-featured admin dashboard for product and content management
- **LeeCMS System**: Custom content management system for static pages
- **Search System**: Typesense-powered intelligent search with typo tolerance
- **Image Proxy**: CORS-compliant image handling for external sources
- **Random Recommendations**: PostgreSQL-based product recommendation engine
- **Mobile Responsive**: Mobile-first design with dark theme support

### Third-Party Integrations
- **Kinguin API**: Product data import and synchronization
- **Stripe Payments**: European payment methods (iDEAL, SEPA, Bancontact, etc.)
- **Social Authentication**: Steam, Discord, Google OAuth integration
- **Email System**: SMTP-based transactional emails
- **reCAPTCHA**: Bot protection for authentication forms

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 15.3.4 with React 19.1.0
- **Styling**: Tailwind CSS 3.4.17 with custom animations
- **UI Components**: Custom component library with Lucide React icons
- **State Management**: React hooks with custom managers
- **Client Storage**: localStorage with SSR-safe utilities

### Backend
- **Runtime**: Node.js with Next.js API routes
- **Database**: PostgreSQL with Neon hosting
- **ORM**: Prisma 6.12.0 for type-safe database operations
- **Authentication**: Custom session-based auth system
- **Payment**: Stripe API with webhook handling
- **Search**: Typesense search engine

### Infrastructure
- **Hosting**: Vercel-optimized deployment
- **Database**: Neon PostgreSQL with SSL
- **CDN**: Custom image proxy for external assets
- **Environment**: Secure environment variable management

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- PostgreSQL database (Neon recommended)
- Stripe account
- npm or yarn package manager

### Setup Steps

1. **Clone the repository**
```bash
git clone <repository-url>
cd gamava-ecommerce
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
Copy `.env.example` to `.env` and configure the following variables:

```bash
# Database Configuration
DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require

# Application Settings
NODE_ENV=development
NEXT_PUBLIC_SITE_URL=http://localhost:3100
PORT=3100
NEXTAUTH_URL=http://localhost:3100

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Authentication Providers
STEAM_API_KEY=your_steam_api_key
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Email Configuration
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_MAILER=SMTP
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_FROM_NAME=Gamava Gaming
EMAIL_FROM_ADDRESS=your_email@gmail.com

# Search Configuration
TYPESENSE_HOST=localhost
TYPESENSE_PORT=8108
TYPESENSE_PROTOCOL=http
TYPESENSE_API_KEY=xyz

# Security
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_recaptcha_site_key
RECAPTCHA_SECRET_KEY=your_recaptcha_secret_key
```

4. **Set up the database**
```bash
# Generate Prisma client
npx prisma generate

# Push database schema
npx prisma db push
```

5. **Start the development server**
```bash
npm run dev
```

The application will be available at `http://localhost:3100`

## 🔧 Environment Variables

### Required Environment Variables

#### Database Configuration
```bash
DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require
```
- PostgreSQL database connection string
- Must include SSL mode for production
- Neon database format recommended

#### Application Settings
```bash
NODE_ENV=development|production
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
PORT=3100
NEXTAUTH_URL=https://yourdomain.com
```

#### Stripe Payment Configuration
```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```
- Get from [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
- Use test keys for development
- Webhook secret from Stripe webhook configuration

#### Authentication Providers

**Steam Authentication**
```bash
STEAM_API_KEY=your_steam_api_key
```
- Get from [Steam Web API](https://steamcommunity.com/dev/apikey)

**Discord Authentication**
```bash
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret
```
- Create application at [Discord Developer Portal](https://discord.com/developers/applications)

**Google Authentication**
```bash
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```
- Create project at [Google Cloud Console](https://console.cloud.google.com/)

#### Email Configuration
```bash
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_MAILER=SMTP
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_LOCAL_DOMAIN=
EMAIL_FROM_NAME=Your Store Name
EMAIL_FROM_ADDRESS=your_email@gmail.com
```
- Use Gmail App Password for EMAIL_PASS
- Enable 2FA and generate app-specific password

#### Search Configuration
```bash
TYPESENSE_HOST=localhost
TYPESENSE_PORT=8108
TYPESENSE_PROTOCOL=http
TYPESENSE_API_KEY=xyz
```
- For development, uses mock implementation
- Configure Typesense server for production

#### Security Configuration
```bash
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6Le...
RECAPTCHA_SECRET_KEY=6Le...
```
- Get from [Google reCAPTCHA](https://www.google.com/recaptcha/admin)
- Use reCAPTCHA v3

## 🗄 Database Schema

The application uses PostgreSQL with the following main tables:

### Core Tables
- **products**: Main product catalog with pricing and metadata
- **categories**: Hierarchical category system
- **users**: User accounts and authentication
- **orders**: Order management with Stripe integration
- **cart**: Persistent cart storage
- **wishlist**: User wishlist management

### CMS Tables
- **pages**: Static page content with LeeCMS
- **page_categories**: Page organization
- **hero_sections**: Homepage hero banners
- **home_sections**: Homepage section management

### Configuration Tables
- **cookie_consent_settings**: GDPR cookie consent
- **email_templates**: Transactional email templates
- **plugin_settings**: Admin plugin configuration

## 🚀 Deployment

### Vercel Deployment (Recommended)

1. **Connect to Vercel**
```bash
npm install -g vercel
vercel login
vercel
```

2. **Configure environment variables in Vercel dashboard**
- Add all environment variables from `.env`
- Ensure production URLs and keys are used

3. **Deploy**
```bash
vercel --prod
```

### Manual Deployment

1. **Build the application**
```bash
npm run build
```

2. **Start production server**
```bash
npm start
```

## 📱 Usage

### Admin Panel
Access the admin panel at `/admin` to:
- Manage products and categories
- Configure homepage sections
- Import products from Kinguin API
- Manage static pages with LeeCMS
- Monitor API performance
- Configure payment settings

### User Features
- Browse products with advanced filtering
- Add items to cart and wishlist
- Secure checkout with multiple payment methods
- User dashboard with order history
- Social authentication login

## 🔧 Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
```

### Code Structure
```
├── components/          # React components
│   ├── admin/          # Admin panel components
│   ├── frontend/       # Public-facing components
│   ├── layout/         # Layout components
│   └── cms/            # LeeCMS components
├── hooks/              # Custom React hooks
├── lib/                # Utility libraries
├── pages/              # Next.js pages and API routes
│   ├── admin/          # Admin pages
│   ├── api/            # API endpoints
│   └── ...             # Public pages
├── prisma/             # Database schema
├── public/             # Static assets
└── styles/             # Global styles
```

### Key Development Features
- **Hot Module Replacement**: Instant updates during development
- **TypeScript Support**: Type-safe development experience
- **Prisma Studio**: Database GUI for development
- **API Monitoring**: Built-in API performance tracking

## 🛡 Security Features

- **Secure Authentication**: Session-based auth with secure cookies
- **SQL Injection Protection**: Prisma ORM with parameterized queries
- **XSS Protection**: Content sanitization with DOMPurify
- **CSRF Protection**: Built-in Next.js CSRF protection
- **Rate Limiting**: API rate limiting and request validation
- **Environment Security**: Secure environment variable management

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Contact the development team
- Check the documentation in `/docs`

## 📄 Page Descriptions

### 🏠 Homepage (`pages/index.jsx`)
The homepage is a dynamic, content-rich landing page that showcases featured products and categories through an advanced carousel system:

**Key Features:**
- **Dynamic Hero Slider**: Admin-configurable hero banners with calls-to-action
- **Database-Driven Sections**: Product sections managed through admin panel (Recommended For You, Best Selling Games, Gift Cards, Software, Subscriptions)
- **Exploration Carousels**: Interactive platform, genre, and price exploration sections with auto-slide functionality
- **Icon Grid Section**: Trust indicators and feature highlights (24/7 Support, Reviews, Fast Delivery)
- **Real-time Loading**: Client-side fallback with loading states and error handling
- **Performance Optimized**: Image preloading and responsive design for all devices

**Fixed Section Order:**
1. Recommended For You (database-driven)
2. Explore By Platform (carousel)
3. Best Selling Games (database-driven)
4. Explore By Genres (carousel)
5. Best Selling Gift Cards (database-driven)
6. Explore By Price (carousel)
7. Best Selling Software (database-driven)
8. Our Features (Icon Grid)
9. Best Selling Subscriptions (database-driven)

### 🛍️ Product Page (`pages/product/[slug].js`)
Individual product pages provide comprehensive product information with enhanced shopping features:

**Key Features:**
- **SEO-Friendly URLs**: Slug-based routing for better search optimization
- **Rich Product Gallery**: Screenshot carousel with auto-play and navigation
- **Detailed Information**: Product description, system requirements, pricing with discounts
- **Interactive Elements**: Add to cart, wishlist, Buy Now with authentication checks
- **Regional Information**: Country availability with searchable region modal
- **Product Recommendations**: Random product suggestions carousel (8 products)
- **Platform Integration**: Platform-specific activation instructions and tooltips
- **Responsive Design**: Mobile-optimized layout with proper image fallbacks

**Specialized Sections:**
- Platform compatibility with tooltips
- System requirements (Windows-focused)
- Activation instructions modal
- Discount labels and pricing display
- User reviews and ratings (when available)

### 📂 Category Pages (`pages/category/[...slug].js`)
Advanced category browsing with comprehensive filtering and sorting capabilities:

**Key Features:**
- **Dynamic Routing**: Multi-level category navigation support
- **Advanced Filtering**: Platform, genre, language, region, price, and type filters
- **Sidebar Filters**: Mobile-responsive filter sidebar with toggle functionality
- **Infinite Scroll**: Load more products as user scrolls
- **Real-time Search**: XHR-based product fetching with performance optimization
- **Cached Data**: Leverages app preloader for faster filter option loading
- **Sort Options**: Price, popularity, and release date sorting
- **Responsive Grid**: Adaptive product grid layout for all screen sizes

**Filter Categories:**
- Platforms (Steam, Epic Games, etc.)
- Genres (Action, Adventure, RPG, etc.)
- Languages (English, Spanish, French, etc.)
- Regions (Global, EU, US, etc.)
- Product Types (Games, Software, DLC)
- Price Range (Min/Max sliders)

### 🔐 Authentication Pages (`pages/auth/[type].js`)
Unified authentication system with multiple entry points and social login integration:

**Supported Auth Types:**
- **Login** (`/auth/login`): Standard email/password login
- **Register** (`/auth/register`): Account creation with validation
- **Forgot Password** (`/auth/forgot-password`): Password reset workflow

**Key Features:**
- **Split-Screen Design**: Visual left panel with form on right
- **Social Authentication**: Steam, Discord, Google OAuth integration
- **reCAPTCHA Protection**: Bot protection on all forms
- **Responsive Layout**: Mobile-first design with backdrop effects
- **Form Validation**: Real-time validation with error handling
- **Navigation Links**: Seamless switching between auth modes
- **Security Features**: Session-based authentication with secure cookies

**Visual Design:**
- Gradient wave backgrounds
- Translucent form containers
- Platform-specific left panel imagery
- Professional blue theme (#00337c)

## 🔧 Core Components

### 🧭 Header Component (`components/frontend/Header.jsx`)
The header is a sophisticated navigation system with advanced search and responsive design:

**Desktop Features:**
- **Mega Menu Dropdown**: Multi-column category navigation with popular products
- **Advanced Search**: Real-time search with dropdown suggestions and history
- **Horizontal Scroll Navigation**: Scrollable menu items with smooth navigation buttons
- **User Authentication**: Login/logout states with user dropdown menu
- **Scroll-based Visibility**: Auto-hide/show navigation based on scroll direction

**Mobile Features:**
- **Collapsible Menu**: Mobile-optimized category sidebar
- **Touch-Friendly Search**: Mobile search dropdown with proper touch targets
- **Responsive Navigation**: Burger menu with category browsing
- **Cart/Wishlist Icons**: Quick access to shopping features

**Key Sections:**
- **Logo and Branding**: Positioned top-left with home link
- **Main Navigation**: Categories, All Offers, Special Pages (horizontally scrollable)
- **Search Bar**: Real-time search with autocomplete and history
- **User Area**: Login/User dropdown, Cart, Wishlist counters
- **Mobile Menu**: Collapsible category sidebar for mobile users

**Technical Features:**
- Scroll detection for header visibility
- ResizeObserver for responsive scroll buttons
- Debounced search with abort controller
- Local storage integration for search history
- CORS-compliant image proxy for product images

### 🦶 Footer Component (`components/frontend/Footer.jsx`)
Database-driven footer with responsive design and comprehensive site navigation:

**Desktop Layout:**
- **4-Column Grid**: Organized sections based on database categories
- **Dynamic Content**: Real-time loading from footer pages API
- **Category Sections**: Quick Links, Customer Service, Legal, Contact Information

**Mobile Layout:**
- **Collapsible Sections**: Accordion-style dropdowns for each category
- **Touch-Optimized**: Easy navigation on mobile devices
- **Compact Design**: Space-efficient layout for small screens

**Footer Categories:**
1. **Quick Links**: Home, Products, About Us, Contact
2. **Customer Service**: Help Center, Returns, Shipping Info, Track Order
3. **Legal**: Privacy Policy, Terms of Service, Cookie Policy, Refund Policy
4. **Contact**: Company contact information with icons

**Content Management:**
- Database-driven page organization
- Admin panel integration for easy updates
- LeeCMS integration for static page content
- Proper SEO-friendly URL routing
- Category-based page sorting and organization

**Technical Features:**
- Responsive grid system (2-4 columns based on screen size)
- Dynamic page fetching from database
- Error handling with fallback content
- Mobile accordion functionality with state management
- Contact information with Font Awesome icons

## 🔄 Recent Updates

See `replit.md` for detailed changelog and recent architectural changes.

---

**Built with ❤️ for the gaming community**# Gameva
# Gameva
