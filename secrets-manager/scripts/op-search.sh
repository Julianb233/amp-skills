#!/bin/bash
# Search 1Password for a secret by service name
# Usage: ./op-search.sh <service-name> [project-name]

SERVICE_NAME="${1:-}"
PROJECT_NAME="${2:-}"

if [ -z "$SERVICE_NAME" ]; then
    echo "Usage: $0 <service-name> [project-name]"
    echo "Example: $0 descope daily-event-insurance"
    exit 1
fi

if [ -z "$OP_SERVICE_ACCOUNT_TOKEN" ]; then
    echo "Error: OP_SERVICE_ACCOUNT_TOKEN not set"
    exit 1
fi

echo "Searching for: $SERVICE_NAME"

# Search by service name
RESULTS=$(op item list --format=json 2>/dev/null | jq -r ".[] | select(.title | ascii_downcase | contains(\"$(echo $SERVICE_NAME | tr '[:upper:]' '[:lower:]')\")) | .title")

if [ -n "$PROJECT_NAME" ]; then
    # Also search by project name
    PROJECT_RESULTS=$(op item list --format=json 2>/dev/null | jq -r ".[] | select(.title | ascii_downcase | contains(\"$(echo $PROJECT_NAME | tr '[:upper:]' '[:lower:]')\")) | .title")
    RESULTS=$(echo -e "$RESULTS\n$PROJECT_RESULTS" | sort -u)
fi

if [ -z "$RESULTS" ]; then
    echo "No items found matching '$SERVICE_NAME'"
    exit 1
fi

echo "Found items:"
echo "$RESULTS"
