#!/usr/bin/env bash

set -euo pipefail

environment="${1:-production}"

if ! gh auth status >/dev/null 2>&1; then
  printf 'GitHub CLI is not authenticated. Run: gh auth login\n' >&2
  exit 1
fi

repository="${GH_REPO:-$(gh repo view --json nameWithOwner --jq '.nameWithOwner')}"

printf '\nRepository:  %s\n' "$repository"
printf 'Environment: %s\n\n' "$environment"

# Create/update GitHub Environment
gh api \
  --method PUT \
  "repos/$repository/environments/$environment" \
  >/dev/null

set_secret() {
  local name="$1"
  local prompt="$2"
  local value

  read -r -p "$prompt: " value

  if [ -z "$value" ]; then
    printf '%s cannot be empty.\n' "$name" >&2
    exit 1
  fi

  printf '%s' "$value" | gh secret set "$name" \
    --env "$environment" \
    --repo "$repository"
}

set_secret SERVER_HOST 'Server host'
set_secret SERVER_USER 'Server user'
set_secret DEPLOY_PATH 'Deployment path'

read -r -p 'Server port [22]: ' server_port
server_port="${server_port:-22}"

printf '%s' "$server_port" | gh secret set SERVER_PORT \
  --env "$environment" \
  --repo "$repository"

read -r -p 'SSH private key file path: ' ssh_key_file

# Expand ~/path
ssh_key_file="${ssh_key_file/#\~/$HOME}"

if [ ! -f "$ssh_key_file" ]; then
  printf 'SSH private key file not found: %s\n' "$ssh_key_file" >&2
  exit 1
fi

gh secret set SERVER_SSH_KEY \
  --env "$environment" \
  --repo "$repository" \
  < "$ssh_key_file"

printf '\nEnvironment secrets uploaded successfully.\n\n'

gh secret list \
  --env "$environment" \
  --repo "$repository"
