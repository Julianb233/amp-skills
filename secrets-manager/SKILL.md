---
name: Secrets Manager
description: This skill should be used when the user provides API keys, client secrets, tokens, credentials, or any sensitive configuration values. Also use when asked to "save a secret", "store API key", "add credentials", "check 1Password", "find API key", or when needing to retrieve or store any authentication credentials. Always check 1Password first before asking the user for secrets.
version: 1.0.0
---

# Secrets Manager

Manage API keys, credentials, and secrets using 1Password as the source of truth. This skill ensures secrets are properly stored, tagged, and retrievable across projects.

## Core Workflow

### When Needing a Secret

1. **Check 1Password first** - Never ask the user for a secret without checking 1Password
2. **Search by service name** - Use `op item list` and grep for the service
3. **Check project-specific items** - Look for items tagged with the project name
4. **Only then ask the user** - If not found, request the secret from the user

### When User Provides a Secret

1. **Save to environment variable** - Export for immediate use
2. **Save to .env.local** - Persist in project's environment file
3. **Store in 1Password** - Create/update item with proper naming and tags
4. **Confirm storage** - Report where the secret was saved

## 1Password Operations

### Authentication

Set the service account token before any operations:

```bash
export OP_SERVICE_ACCOUNT_TOKEN="<token>"
op whoami  # Verify connection
```

### Search for Secrets

```bash
# List all items
op item list

# Search by name (case-insensitive)
op item list | grep -i "<service-name>"

# Search in specific vault
op item list --vault="API-Keys" | grep -i "<service-name>"

# Get item details
op item get "<item-id-or-title>" --format=json
```

### Retrieve a Secret Value

```bash
# Get specific field from item
op item get "<item-name>" --fields label=credential

# Get password/API key field
op item get "<item-name>" --fields label=password

# Get all fields
op item get "<item-name>" --format=json | jq '.fields'
```

### Create New Secret

Use this naming convention: `<SERVICE>-<project-name>`

```bash
op item create \
  --category="API Credential" \
  --title="<SERVICE>-<project-name>" \
  --vault="API-Keys" \
  --tags="<project-name>,api-key,<service-name>" \
  "credential=<the-secret-value>" \
  "url=<service-url-if-applicable>" \
  "notes=<description-of-what-this-is-for>"
```

### Update Existing Secret

```bash
op item edit "<item-name>" \
  "credential=<new-value>"
```

## Naming Conventions

### Item Titles
- Format: `<SERVICE>-<project>` or `<SERVICE>-global`
- Examples:
  - `DESCOPE-daily-event-insurance`
  - `OPENAI-global`
  - `STRIPE-daily-event-insurance`

### Tags
Always include these tags:
- Project name (e.g., `daily-event-insurance`)
- Service type (e.g., `api-key`, `oauth`, `database`)
- Service name lowercase (e.g., `descope`, `stripe`, `openai`)

### Vault Selection
- `API-Keys` - For API credentials, tokens, keys
- Create project-specific vaults for large projects if needed

## Environment File Integration

### Save to .env.local

After storing in 1Password, also save to the project's `.env.local`:

```bash
# Append or update in .env.local
echo "<VAR_NAME>=<value>" >> .env.local

# Or use sed for update
sed -i "s/^<VAR_NAME>=.*/<VAR_NAME>=<new-value>/" .env.local
```

### Common Variable Names

| Service | Variable Name |
|---------|--------------|
| Descope | `DESCOPE_PROJECT_ID`, `DESCOPE_MANAGEMENT_KEY` |
| OpenAI | `OPENAI_API_KEY` |
| Anthropic | `ANTHROPIC_API_KEY` |
| Stripe | `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY` |
| Supabase | `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` |
| Vercel | `VERCEL_TOKEN` |
| GitHub | `GITHUB_TOKEN` |

## Example Workflows

### User Provides New API Key

```
User: "Here's my Descope management key: K2abc123..."

Action:
1. Export immediately: export DESCOPE_MANAGEMENT_KEY="K2abc123..."
2. Update .env.local
3. Create/update 1Password item:
   op item create --category="API Credential" \
     --title="DESCOPE-daily-event-insurance" \
     --vault="API-Keys" \
     --tags="daily-event-insurance,api-key,descope" \
     "management_key=K2abc123..." \
     "project_id=P38..." \
     "url=https://app.descope.com"
4. Confirm: "Saved DESCOPE_MANAGEMENT_KEY to .env.local and 1Password"
```

### Need to Find Existing Key

```
Task: Need Stripe API key for this project

Action:
1. Search 1Password:
   op item list | grep -i stripe
   op item list | grep -i "daily-event"
2. If found, retrieve:
   op item get "STRIPE-daily-event-insurance" --fields label=secret_key
3. If not found, check .env.local
4. Only if neither has it, ask user
```

## Scripts

### scripts/op-search.sh
Search 1Password for a secret by service name.

### scripts/op-save.sh
Save a new secret to 1Password with proper naming and tags.

## Additional Resources

### Reference Files
- **`references/common-services.md`** - List of common services and their variable names
- **`references/1password-categories.md`** - 1Password item categories and when to use them

## Critical Rules

1. **Never ask for secrets without checking 1Password first**
2. **Always use consistent naming**: `<SERVICE>-<project>`
3. **Always tag with project name** for discoverability
4. **Save to both** .env.local AND 1Password
5. **Confirm storage location** to user after saving
6. **Use API-Keys vault** for all API credentials
