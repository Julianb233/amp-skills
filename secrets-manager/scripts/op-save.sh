#!/bin/bash
# Save a secret to 1Password with proper naming and tags
# Usage: ./op-save.sh <service-name> <project-name> <field-name> <secret-value> [url]

SERVICE_NAME="${1:-}"
PROJECT_NAME="${2:-}"
FIELD_NAME="${3:-}"
SECRET_VALUE="${4:-}"
URL="${5:-}"

if [ -z "$SERVICE_NAME" ] || [ -z "$PROJECT_NAME" ] || [ -z "$FIELD_NAME" ] || [ -z "$SECRET_VALUE" ]; then
    echo "Usage: $0 <service-name> <project-name> <field-name> <secret-value> [url]"
    echo "Example: $0 DESCOPE daily-event-insurance management_key 'K2abc123...' 'https://app.descope.com'"
    exit 1
fi

if [ -z "$OP_SERVICE_ACCOUNT_TOKEN" ]; then
    echo "Error: OP_SERVICE_ACCOUNT_TOKEN not set"
    exit 1
fi

ITEM_TITLE="${SERVICE_NAME}-${PROJECT_NAME}"
SERVICE_LOWER=$(echo "$SERVICE_NAME" | tr '[:upper:]' '[:lower:]')

echo "Creating/updating 1Password item: $ITEM_TITLE"

# Check if item already exists
EXISTING=$(op item get "$ITEM_TITLE" --format=json 2>/dev/null)

if [ -n "$EXISTING" ]; then
    echo "Item exists, updating..."
    op item edit "$ITEM_TITLE" "${FIELD_NAME}=${SECRET_VALUE}"
else
    echo "Creating new item..."
    if [ -n "$URL" ]; then
        op item create \
            --category="API Credential" \
            --title="$ITEM_TITLE" \
            --vault="API-Keys" \
            --tags="${PROJECT_NAME},api-key,${SERVICE_LOWER}" \
            "${FIELD_NAME}=${SECRET_VALUE}" \
            "url=${URL}"
    else
        op item create \
            --category="API Credential" \
            --title="$ITEM_TITLE" \
            --vault="API-Keys" \
            --tags="${PROJECT_NAME},api-key,${SERVICE_LOWER}" \
            "${FIELD_NAME}=${SECRET_VALUE}"
    fi
fi

if [ $? -eq 0 ]; then
    echo "Successfully saved to 1Password: $ITEM_TITLE"
else
    echo "Error saving to 1Password"
    exit 1
fi
