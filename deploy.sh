#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Automerge Notes Deployment Helper ===${NC}"
echo -e "${BLUE}This script will help you deploy to GitHub and Vercel${NC}"
echo ""

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "Git could not be found. Please install Git first."
    exit 1
fi

# Check if repository is already initialized
if [ ! -d ".git" ]; then
    echo -e "${BLUE}Initializing Git repository...${NC}"
    git init
    
    echo -e "${GREEN}Git repository initialized.${NC}"
else
    echo -e "${GREEN}Git repository already initialized.${NC}"
fi

# Add all files
echo -e "${BLUE}Adding files to Git...${NC}"
git add .

# Commit changes
echo -e "${BLUE}Committing changes...${NC}"
git commit -m "Initial commit of Automerge Notes"

echo -e "${GREEN}Changes committed.${NC}"

# Prompt for GitHub repository URL
echo ""
echo -e "${BLUE}To deploy to GitHub, create a new repository on GitHub first.${NC}"
echo -e "${BLUE}Enter your GitHub repository URL (e.g., https://github.com/username/repo-name):${NC}"
read repo_url

if [ -n "$repo_url" ]; then
    # Add remote
    echo -e "${BLUE}Adding remote repository...${NC}"
    git remote add origin $repo_url
    
    # Push to GitHub
    echo -e "${BLUE}Pushing to GitHub...${NC}"
    git push -u origin main || git push -u origin master
    
    echo -e "${GREEN}Successfully pushed to GitHub!${NC}"
    
    # Vercel deployment instructions
    echo ""
    echo -e "${BLUE}=== Vercel Deployment Instructions ===${NC}"
    echo -e "1. Go to https://vercel.com/new"
    echo -e "2. Import your GitHub repository"
    echo -e "3. Vercel should auto-detect your project settings"
    echo -e "4. Click 'Deploy'"
    echo -e "5. Once deployed, your app will be available at a Vercel URL"
    echo -e "${GREEN}Your app is now ready for deployment to Vercel!${NC}"
else
    echo "No repository URL provided. Skipping GitHub push."
    echo "You can manually push to GitHub later using:"
    echo "  git remote add origin YOUR_REPO_URL"
    echo "  git push -u origin main"
fi
