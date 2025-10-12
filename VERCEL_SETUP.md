# Vercel CI/CD Setup Instructions

This repository is configured for automatic deployment with Vercel. Follow these steps to set up the integration.

## Prerequisites

1. **Vercel Account**: Ensure you have a Vercel account
2. **Vercel CLI**: Install globally with `npm install -g vercel`
3. **Repository Access**: Admin access to this GitHub repository

## Setup Steps

### 1. Connect Repository to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import this GitHub repository
4. Configure the project settings:
   - **Framework Preset**: Docusaurus 2
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
   - **Install Command**: `npm install`

### 2. Get Vercel Project Information

After creating the project in Vercel, you'll need these values:

```bash
# Run in your local project directory
vercel link
# This will create .vercel/project.json with your project info
```

### 3. Configure GitHub Secrets

In your GitHub repository, go to **Settings > Secrets and Variables > Actions** and add:

| Secret Name | Description | How to Get |
|-------------|-------------|------------|
| `VERCEL_TOKEN` | Vercel API Token | [Vercel Account Settings > Tokens](https://vercel.com/account/tokens) |
| `VERCEL_ORG_ID` | Organization ID | From `.vercel/project.json` or Vercel CLI |
| `VERCEL_PROJECT_ID` | Project ID | From `.vercel/project.json` or Vercel CLI |

#### Getting Vercel Token
1. Go to [Vercel Account Settings](https://vercel.com/account/tokens)
2. Create a new token with appropriate scope
3. Copy the token value

#### Getting Project IDs
Run these commands in your project directory:
```bash
# Link project (if not already done)
vercel link

# Get organization ID
vercel teams ls

# Get project ID
cat .vercel/project.json
```

### 4. Environment Variables (Optional)

If your documentation needs environment variables, add them in:
- **Vercel Dashboard**: Project Settings > Environment Variables
- **GitHub Secrets**: For CI/CD pipeline access

## How It Works

### Automatic Deployments

- **Pull Requests**: Creates preview deployments with unique URLs
- **Main Branch**: Deploys to production automatically
- **All Branches**: Builds and tests but doesn't deploy

### Workflow Stages

1. **Build & Test**: 
   - Install dependencies
   - Type checking
   - Build verification

2. **Preview Deployment** (PRs only):
   - Deploy to unique preview URL
   - Comment on PR with preview link
   - Accessible to team for review

3. **Production Deployment** (main branch):
   - Deploy to production domain
   - Update deployment status
   - Available at your custom domain

### Preview URLs

Preview deployments are automatically commented on PRs:

```
## 📖 Documentation Preview

🚀 **Live Preview**: https://docs-git-feature-branch-yourorg.vercel.app

This preview deployment includes all changes from this PR.
```

## Configuration Files

- **`.github/workflows/deploy.yml`**: GitHub Actions workflow
- **`vercel.json`**: Vercel deployment configuration
- **`lighthouserc.js`**: Lighthouse CI performance testing

## Monitoring & Performance

The CI/CD pipeline includes:
- **Build verification** on all PRs
- **Performance monitoring** with Lighthouse CI
- **Deployment status** tracking
- **Error reporting** and rollback capabilities

## Troubleshooting

### Common Issues

1. **Missing Secrets**: Ensure all required secrets are set in GitHub
2. **Build Failures**: Check the Actions tab for detailed logs
3. **Permission Issues**: Verify Vercel token has appropriate permissions
4. **Domain Configuration**: Ensure custom domains are properly configured in Vercel

### Debug Commands

```bash
# Test local build
npm run build

# Verify Vercel connection
vercel whoami
vercel ls

# Manual deployment (for testing)
vercel --prod
```

## Support

- **Vercel Documentation**: [vercel.com/docs](https://vercel.com/docs)
- **GitHub Actions**: [docs.github.com/actions](https://docs.github.com/actions)
- **Docusaurus Deployment**: [docusaurus.io/docs/deployment](https://docusaurus.io/docs/deployment)

---

*This setup ensures your documentation is automatically built, tested, and deployed with every change, providing seamless preview deployments for PRs and instant production updates.*