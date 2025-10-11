# Quick Vercel Deployment Setup

This guide walks you through deploying the Cadence docs to Vercel in ~10 minutes.

## Prerequisites

- [ ] GitHub repository `cadence-day/docs` exists
- [ ] PR #1 merged to `main` branch (or ready to merge)
- [ ] Vercel account (free tier is fine) - [Sign up here](https://vercel.com/signup)
- [ ] Access to DNS settings for `cadence.day` domain

## Step 1: Import Project to Vercel (2 minutes)

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New..."** → **"Project"**
3. Under "Import Git Repository":
   - Click **"Import"** next to `cadence-day/docs`
   - If not listed, click "Adjust GitHub App Permissions" and grant access
4. Configure project:
   - **Framework Preset**: Docusaurus 2 (should auto-detect from `vercel.json`)
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `build` (auto-detected)
5. Click **"Deploy"**
6. Wait 2-3 minutes for first deployment
7. You'll get a URL like: `https://docs-xxxxxxxxxxxx.vercel.app`

## Step 2: Add Custom Domain (3 minutes)

1. In Vercel project dashboard, go to **Settings** → **Domains**
2. Add domain: `docs.cadence.day`
3. Vercel will show you need to add a DNS record:
   ```
   Type: CNAME
   Name: docs
   Value: cname.vercel-dns.com
   ```
4. Go to your DNS provider (Cloudflare, Route53, etc.)
5. Add the CNAME record as shown
   - If using Cloudflare: Set "Proxy status" to **DNS only** (grey cloud)
6. Return to Vercel and click **"Verify"**
7. Wait 5-10 minutes for DNS propagation
8. SSL certificate will auto-provision (~5 minutes)

## Step 3: Configure GitHub Actions (3 minutes)

For automated deployments on every push/PR:

1. Get Vercel credentials:
   - **VERCEL_TOKEN**: 
     - Go to [Vercel Account Settings → Tokens](https://vercel.com/account/tokens)
     - Click "Create Token"
     - Name: "GitHub Actions - Cadence Docs"
     - Scope: Full Account
     - Expiration: No expiration
     - Copy the token
   
   - **VERCEL_ORG_ID** and **VERCEL_PROJECT_ID**:
     - In your local repo, run: `vercel link`
     - Or check `.vercel/project.json` after deploying once locally
     - Or get from Vercel project settings

2. Add GitHub Secrets:
   - Go to [github.com/cadence-day/docs/settings/secrets/actions](https://github.com/cadence-day/docs/settings/secrets/actions)
   - Click **"New repository secret"** for each:
     - Name: `VERCEL_TOKEN`, Value: [paste token from step 1]
     - Name: `VERCEL_ORG_ID`, Value: [your org/user ID]
     - Name: `VERCEL_PROJECT_ID`, Value: [your project ID]

3. Test the workflow:
   - Push to `main` branch
   - Check **Actions** tab in GitHub
   - You should see "Deploy to Vercel" workflow running

## Step 4: Apply for Algolia DocSearch (2 minutes)

1. Go to [docsearch.algolia.com/apply](https://docsearch.algolia.com/apply/)
2. Fill in the form:
   - **Website URL**: `https://docs.cadence.day`
   - **Email**: `admin@cadence.day`
   - **Repository**: `https://github.com/cadence-day/docs`
   - **GitHub username**: `brunoadam` (or org admin)
   - **Are you the owner?**: Yes
   - **Is the content technical documentation?**: Yes
3. Submit application
4. **Response time**: 1-2 weeks
5. Once approved, update `docusaurus.config.ts`:
   ```typescript
   algolia: {
     appId: 'YOUR_APP_ID',        // Replace with credentials from Algolia
     apiKey: 'YOUR_API_KEY',      // Search-only API key (safe for public)
     indexName: 'cadence-docs',
     // ... rest stays the same
   },
   ```

## Step 5: Verify Deployment (2 minutes)

1. **Check site is live**:
   ```bash
   curl -I https://docs.cadence.day
   # Should return: HTTP/2 200
   ```

2. **Test DNS resolution**:
   ```bash
   dig docs.cadence.day +short
   # Should return Vercel IP or CNAME
   ```

3. **Browse the site**:
   - Open https://docs.cadence.day
   - Check navigation works
   - Test FAQ and Features pages
   - Try locale switcher (top-right)
   - Verify dark/light mode toggle

4. **Test build locally** (optional):
   ```bash
   cd cadence-docs
   npm run build
   npm run serve
   # Visit http://localhost:3000
   ```

## Troubleshooting

### Domain not resolving
- **Wait longer**: DNS can take up to 48 hours (usually 5-10 minutes)
- **Check DNS**: `dig docs.cadence.day` should show CNAME to Vercel
- **Flush cache**: `sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder`

### Build fails on Vercel
- **Check build logs** in Vercel dashboard
- **Node version**: Vercel uses Node 18 by default (our setup uses this)
- **Dependencies**: Ensure `package-lock.json` is committed

### SSL certificate not provisioning
- Vercel auto-provisions SSL within 5-10 minutes
- Check domain is verified in Vercel settings
- Ensure DNS record is correct (CNAME to `cname.vercel-dns.com`)

### GitHub Actions failing
- **Verify secrets**: Check all 3 secrets are added correctly
- **Check workflow**: View logs in Actions tab
- **Re-run**: Click "Re-run all jobs" if it was a temporary issue

## Next Steps

After deployment is live:

1. **Monitor**: Check Vercel analytics for traffic
2. **Update content**: Edit Markdown files in `docs/` directory
3. **Translate**: Add translations in `i18n/{locale}/` folders
4. **Algolia**: Wait for DocSearch approval, then update config
5. **Analytics** (optional): Add Google Analytics or Plausible

## Resources

- **DEPLOYMENT.md**: Comprehensive deployment guide
- **Vercel Dashboard**: https://vercel.com/\[your-username\]/docs
- **GitHub Actions**: https://github.com/cadence-day/docs/actions
- **Algolia DocSearch**: https://docsearch.algolia.com
- **Vercel Docs**: https://vercel.com/docs

---

**Estimated Total Time**: 10-15 minutes (excluding DNS propagation and Algolia approval)

**Support**: For issues, check DEPLOYMENT.md or create a GitHub issue.
