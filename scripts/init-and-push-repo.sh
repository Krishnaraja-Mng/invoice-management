#!/usr/bin/env bash
set -e

# Usage: ./scripts/init-and-push-repo.sh [--private]
# Run from project root. Requires git installed. If --private is passed, repo will be private.

PRIVATE=false
if [ "$1" = "--private" ]; then
  PRIVATE=true
fi

REPO_OWNER="Krishnaraja-Mng"
REPO_NAME="invoice-management"
REMOTE="origin"
BRANCH="main"
COMMIT_MSG="Initial scaffold: Express + TypeORM + React Native (invoice-management)"

# Ensure .gitignore exists
if [ ! -f .gitignore ]; then
  echo "Warning: .gitignore not found. Please ensure you don't commit secrets."
fi

# Initialize git if needed
if [ ! -d .git ]; then
  git init
fi

git checkout -B "$BRANCH"

git add .
git commit -m "$COMMIT_MSG" || echo "No changes to commit"

# Use gh if present and authenticated
if command -v gh >/dev/null 2>&1; then
  echo "Detected gh CLI. Creating repo on GitHub..."
  if [ "$PRIVATE" = true ]; then
    gh repo create "${REPO_OWNER}/${REPO_NAME}" --private --source=. --remote="$REMOTE" --push --confirm
  else
    gh repo create "${REPO_OWNER}/${REPO_NAME}" --public --source=. --remote="$REMOTE" --push --confirm
  fi
  echo "Repo created and pushed via gh."
else
  echo "gh CLI not found. Please create the repository on GitHub (or install gh)."
  echo "Manual remote commands:"
  echo "  git remote add ${REMOTE} https://github.com/${REPO_OWNER}/${REPO_NAME}.git"
  echo "  git push -u ${REMOTE} ${BRANCH}"
fi