# Aircraft Executives Ghost CMS

Enhanced Ghost CMS platform for Aircraft Executives - a luxury aviation brokerage specializing in high-end aircraft sales and acquisitions.

## 🚁 Features

### Enhanced Themes
- **Swiss Design Aesthetic**: Clean, professional typography and spacing
- **Video Hero Backgrounds**: Engaging visual storytelling
- **Mobile-First Responsive**: Optimized for all devices
- **Trust Indicators**: IADA accreditation and transaction metrics prominently displayed

### SEO Optimization
- **Aviation-Specific Schema Markup**: LocalBusiness and Product structured data
- **Performance Optimized**: Lazy loading, optimized images, and fast Core Web Vitals
- **Individual Aircraft Pages**: Dedicated templates with detailed specifications
- **Market Intelligence Content**: Blog posts and market analysis

### UX Enhancements
- **Qualified Lead Forms**: Capture buyer intent and timeline
- **Aircraft Comparison**: Side-by-side specification comparison
- **Trust & Social Proof**: Client testimonials and success stories
- **Accessibility Compliant**: WCAG 2.2 AA standards

## 🛠 Technical Stack

- **Ghost CMS**: v5.130.2
- **Database**: SQLite (production) / MySQL (optional)
- **Hosting**: Vercel Serverless Functions
- **CDN**: Vercel Edge Network
- **Analytics**: Google Tag Manager integration ready

## 🚀 Deployment

### Quick Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/hilmes/aircraft-executives-ghost)

### Manual Deployment

1. Clone the repository:
```bash
git clone https://github.com/hilmes/aircraft-executives-ghost.git
cd aircraft-executives-ghost
```

2. Install dependencies:
```bash
npm install
```

3. Deploy to Vercel:
```bash
vercel --prod
```

## 🔧 Configuration

### Environment Variables

For SQLite (default):
- `USE_SQLITE=true`

For MySQL (optional):
- `database__connection__host`
- `database__connection__user`
- `database__connection__password`
- `database__connection__database`

### Theme Configuration

The enhanced themes are located in `content/themes/aircraft-executives-final-v2/`:
- `default-enhanced.hbs` - Enhanced layout with trust indicators
- `index-enhanced.hbs` - Optimized homepage with conversion features
- `post-aircraft.hbs` - Dedicated aircraft listing template

## 📊 Performance Features

### Core Web Vitals Optimization
- **LCP**: Optimized hero images and lazy loading
- **FID**: Minimal JavaScript and efficient event handlers
- **CLS**: Reserved space for dynamic content

### SEO Features
- Aviation industry schema markup
- Optimized meta descriptions and titles
- Internal linking structure
- Mobile-first indexing ready

## 🎯 Business Features

### Lead Generation
- Qualified inquiry forms with intent capture
- Timeline-based lead scoring
- Contact preference management
- Newsletter integration

### Aircraft Listings
- Detailed specification templates
- High-resolution photo galleries
- Market analysis integration
- Comparison functionality

### Trust Building
- IADA accreditation display
- Transaction volume metrics
- Client testimonials
- Industry certifications

## 📈 Implementation Roadmap

See `IMPLEMENTATION_ROADMAP.md` for the complete 3-month enhancement plan including:
- Phase 1: Foundation (Weeks 1-2)
- Phase 2: Content & Features (Weeks 3-4)
- Phase 3: Advanced Features (Month 2)
- Phase 4: Optimization & Scale (Month 3)

## 🔗 Live Site

- **Production**: https://aircraft-executives-ghost-kkyfnbdwo-hilmes-projects.vercel.app
- **GitHub**: https://github.com/hilmes/aircraft-executives-ghost

## 📞 Support

For technical support or customization requests:
- Email: sales@aircraftexecutives.com
- Phone: (404) 410-5638

---

Built with ❤️ for the luxury aviation industry using Ghost CMS and modern web technologies.

🤖 *Enhanced with Claude Code AI assistance*