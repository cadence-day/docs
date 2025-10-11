# Cadence Documentation - Deployment Guide

This guide covers deploying the Cadence documentation site to production.

## Table of Contents

- [Vercel Deployment (Recommended)](#vercel-deployment-recommended)
- [Netlify Deployment](#netlify-deployment)
- [GitHub Pages Deployment](#github-pages-deployment)
- [DNS Configuration](#dns-configuration)
- [Algolia DocSearch Setup](#algolia-docsearch-setup)
- [Environment Variables](#environment-variables)
- [CI/CD with GitHub Actions](#cicd-with-github-actions)
- [Troubleshooting](#troubleshooting)

## Vercel Deployment (Recommended)

Vercel provides the best developer experience for Docusaurus sites with automatic deployments, preview environments, and global CDN.

### Initial Setup

1. **Install Vercel CLI** (optional):
   ```bash
   npm install -g vercel
   ```

2. **Connect GitHub Repository**:
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import the `cadence-day/docs` repository
   - Vercel will auto-detect Docusaurus settings from `vercel.json`

3. **Configure Project**:
   - **Framework Preset**: Docusaurus 2 (auto-detected)
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
   - **Install Command**: `npm install`

4. **Deploy**:
   - Click "Deploy"
   - First deployment will take 2-3 minutes
   - You'll get a `.vercel.app` domain

### Custom Domain Setup

1. **Add Domain in Vercel**:
   - Go to Project Settings → Domains
   - Add `docs.cadence.day`
   - Vercel will provide DNS records

2. **Configure DNS** (see [DNS Configuration](#dns-configuration))

### Environment Variables

No environment variables are required for the documentation site. Algolia search credentials are in `docusaurus.config.ts` (public API key only).

### Automatic Deployments

- **Production**: Pushes to `main` branch deploy to `docs.cadence.day`
- **Preview**: Pull requests get preview URLs (`docs-git-{branch}-cadence.vercel.app`)
- **GitHub Integration**: Status checks on PRs show deployment status

## Netlify Deployment

Alternative deployment option with similar features to Vercel.

### Setup

1. **Connect Repository**:
   - Go to [netlify.com](https://netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Choose GitHub and select `cadence-day/docs`

2. **Build Settings**:
   ```
   Build command: npm run build
   Publish directory: build
   ```

3. **Deploy Site**

4. **Custom Domain**:
   - Go to Site Settings → Domain management
   - Add custom domain `docs.cadence.day`
   - Configure DNS (see [DNS Configuration](#dns-configuration))

## GitHub Pages Deployment

Free hosting option with GitHub, but requires more manual configuration.

### Setup

1. **Update `docusaurus.config.ts`**:
   ```typescript
   const config: Config = {
     url: 'https://cadence-day.github.io',
     baseUrl: '/docs/',
     organizationName: 'cadence-day',
     projectName: 'docs',
     trailingSlash: false,
     // ... rest of config
   };
   ```

2. **Deploy Script**:
   ```bash
   npm run deploy
   ```
   This builds and pushes to `gh-pages` branch.

3. **Enable GitHub Pages**:
   - Go to repository Settings → Pages
   - Source: Deploy from branch `gh-pages`
   - Save

4. **Custom Domain** (optional):
   - Add `CNAME` file with `docs.cadence.day`
   - Configure DNS

## DNS Configuration

### For Vercel or Netlify

Add a CNAME record in your DNS provider (e.g., Cloudflare, Route53):

```
Type: CNAME
Name: docs
Value: cname.vercel-dns.com  (or cname.netlify.com for Netlify)
TTL: Auto
Proxy: DNS only (if using Cloudflare)
```

### For GitHub Pages

Add a CNAME record:

```
Type: CNAME
Name: docs
Value: cadence-day.github.io
TTL: Auto
```

### Verification

Wait for DNS propagation (can take up to 48 hours, usually 5-10 minutes):

```bash
dig docs.cadence.day
nslookup docs.cadence.day
```

## Algolia DocSearch Setup

Algolia DocSearch is free for open-source documentation sites.

### Apply for DocSearch

1. **Submit Application**:
   - Go to [docsearch.algolia.com/apply](https://docsearch.algolia.com/apply/)
   - Fill in:
     - **Website URL**: https://docs.cadence.day
     - **Email**: admin@cadence.day
     - **Repository**: https://github.com/cadence-day/docs
     - **GitHub username**: brunoadam (or organization admin)

2. **Requirements**:
   - ✅ Documentation must be public
   - ✅ Website must be production ready
   - ✅ You must be the owner
   - ✅ Content must be technical documentation

3. **Response Time**: 1-2 weeks

### Configure Algolia Credentials

Once approved, you'll receive:
- `appId`
- `apiKey` (search-only, safe for public use)
- `indexName`

Update `docusaurus.config.ts`:

```typescript
algolia: {
  appId: 'YOUR_APP_ID',           // Replace with your App ID
  apiKey: 'YOUR_API_KEY',         // Replace with your Search API Key
  indexName: 'cadence-docs',      // Usually your site name
  contextualSearch: true,
  searchParameters: {},
  searchPagePath: 'search',
},
```

### Manual Algolia Setup (Alternative)

If you need search immediately or don't qualify for DocSearch:

1. Create free Algolia account at [algolia.com](https://www.algolia.com/)
2. Create an application
3. Install Algolia crawler or use custom indexing
4. Update `docusaurus.config.ts` with credentials

## Environment Variables

### GitHub Actions Secrets

For CI/CD deployment, add these secrets in GitHub repository settings (Settings → Secrets → Actions):

| Secret Name | Description | Where to Find |
|------------|-------------|---------------|
| `VERCEL_TOKEN` | Vercel authentication token | Vercel Account Settings → Tokens |
| `VERCEL_ORG_ID` | Vercel organization/user ID | `.vercel/project.json` after first deploy |
| `VERCEL_PROJECT_ID` | Vercel project ID | `.vercel/project.json` after first deploy |

### Local Environment (Optional)

Create `.env.local` for local development (not committed):

```bash
# Not required for basic docs, but useful for advanced features
ALGOLIA_APP_ID=your_app_id
ALGOLIA_API_KEY=your_search_api_key
ALGOLIA_INDEX_NAME=cadence-docs
```

## CI/CD with GitHub Actions

The repository includes automated CI/CD via `.github/workflows/deploy.yml`.

### Workflow Overview

1. **Trigger**: Runs on push/PR to `main` branch
2. **Build Job**: 
   - Installs dependencies
   - Builds the site
   - Uploads build artifact
3. **Test Job**:
   - Type checks TypeScript
   - Tests production build

### Manual Deployment

Trigger workflow manually:
1. Go to Actions tab in GitHub
2. Select "Deploy to Vercel" workflow
3. Click "Run workflow"

### Deployment Status

- Check deployment status in GitHub Actions tab
- Vercel bot comments on PRs with preview URLs
- Production deployments show in Vercel dashboard

## Troubleshooting

### Build Failures

**Error: Module not found**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Error: Broken links**
```bash
# Check for broken internal links
npm run build 2>&1 | grep -i "broken"
```

### Algolia Search Not Working

1. **Verify credentials** in `docusaurus.config.ts`
2. **Check browser console** for API errors
3. **Ensure site is indexed**: 
   - DocSearch crawler runs weekly
   - Check Algolia dashboard for index status

### DNS Issues

**CNAME not resolving**:
```bash
# Check DNS propagation
dig docs.cadence.day +short

# Flush local DNS cache (macOS)
sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder
```

**SSL certificate errors**:
- Vercel/Netlify auto-provision SSL (takes ~5 minutes)
- Check custom domain settings in platform dashboard

### Vercel Deployment Fails

1. **Check build logs** in Vercel dashboard
2. **Verify `vercel.json`** configuration
3. **Check node version**: Vercel uses Node 18 by default
4. **Clear Vercel cache**:
   ```bash
   vercel --force
   ```

### Multi-language Issues

**Locale not building**:
1. Check `i18n` config in `docusaurus.config.ts`
2. Verify locale folders exist: `i18n/de/`, `i18n/da/`, etc.
3. Ensure translated content exists for each locale

**Locale switcher not working**:
- Check navbar `localeDropdown` configuration
- Verify `baseUrl` is set correctly

## Performance Optimization

### Build Performance

```bash
# Use parallel builds (automatically enabled)
npm run build

# Clear Docusaurus cache
npm run clear

# Analyze bundle size
npm run build -- --bundle-analyzer
```

### Production Optimization

- **Image optimization**: Use WebP format, compress images
- **Code splitting**: Docusaurus automatically code-splits by route
- **CDN caching**: Vercel/Netlify handle this automatically
- **Lazy loading**: Enabled by default for images and components

## Monitoring

### Analytics (Optional)

Add analytics to `docusaurus.config.ts`:

```typescript
themeConfig: {
  // Google Analytics
  gtag: {
    trackingID: 'G-XXXXXXXXXX',
    anonymizeIP: true,
  },
  
  // Or Plausible (privacy-friendly)
  // In custom script via src/pages/index.tsx
}
```

### Uptime Monitoring

Use services like:
- [UptimeRobot](https://uptimerobot.com) (free)
- [Pingdom](https://www.pingdom.com)
- Vercel Analytics (built-in)

## Maintenance

### Regular Updates

```bash
# Update dependencies monthly
npm update

# Check for major version updates
npm outdated

# Update Docusaurus
npm install @docusaurus/core@latest @docusaurus/preset-classic@latest
```

### Content Updates

1. Edit Markdown files in `docs/`
2. Commit and push to `main`
3. Vercel auto-deploys in ~2 minutes
4. Algolia re-indexes weekly (or trigger manual crawl)

## Support

- **Documentation Issues**: [GitHub Issues](https://github.com/cadence-day/docs/issues)
- **Vercel Support**: [vercel.com/support](https://vercel.com/support)
- **Docusaurus Docs**: [docusaurus.io](https://docusaurus.io)
- **Algolia Support**: [support.algolia.com](https://support.algolia.com)

---

**Last Updated**: January 2025  
**Maintained by**: Cadence Team
