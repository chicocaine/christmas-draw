# Git Workflow: Dev to Production

## Branch Structure
- `dev` - Development branch (you're here)
- `main` - Production branch (deployed to Fly.io)

## Development Workflow

### Working in Dev
```bash
# Make sure you're on dev branch
git checkout dev

# Your changes...
git add .
git commit -m "feat: your feature"
git push origin dev
```

### Deploying to Production

1. **Merge dev to main:**
```bash
# Switch to main
git checkout main

# Merge dev into main
git merge dev

# Push to main
git push origin main
```

2. **Deploy to Fly.io:**
```bash
# Deploy (automatically uses .env.production)
fly deploy

# Or if you want to deploy from dev branch directly:
git checkout dev
fly deploy  # Still uses .env.production in Docker build
```

## Environment Files

- `.env.development` - Auto-loaded in `npm run dev` (committed to git)
- `.env.production` - Auto-loaded in `npm run build` (committed to git)
- `.env` - Local overrides (NOT committed, in .gitignore)
- `.env.local` - Local secrets (NOT committed, in .gitignore)

## Key Points

✅ **Vite automatically picks the right env file:**
- `npm run dev` → uses `.env.development`
- `npm run build` → uses `.env.production`
- Docker build → uses `.env.production`

✅ **No manual env switching needed** - it's automatic!

✅ **Safe to merge** - environment configs are in separate files

✅ **Can deploy from any branch** - Docker always uses `.env.production`
