#!/bin/bash

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Change to the script directory
cd "$SCRIPT_DIR"

# Load environment variables from .env if it exists
if [ -f ".env" ]; then
    export $(grep -v '^#' .env | xargs)
fi

# Parse command line arguments
HEADLESS=false
BROWSERBASE=false
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --headless) HEADLESS=true ;;
        --browserbase) BROWSERBASE=true ;;
        *) echo "Unknown parameter: $1"; exit 1 ;;
    esac
    shift
done

# Check for required API keys
if [ -z "$ANTHROPIC_API_KEY" ]; then
    echo "Warning: ANTHROPIC_API_KEY not set. Stagehand requires this for AI features."
    echo "Set it with: export ANTHROPIC_API_KEY=your_key"
fi

if [ "$BROWSERBASE" = true ] && [ -z "$BROWSERBASE_API_KEY" ]; then
    echo "Warning: BROWSERBASE_API_KEY not set but --browserbase flag used."
    echo "Set it with: export BROWSERBASE_API_KEY=your_key"
fi

echo "Installing dependencies..."
npm install

echo "Checking Playwright browser installation..."
npx playwright install chromium

echo ""
echo "Stagehand environment ready!"
echo "  HEADLESS: $HEADLESS"
echo "  BROWSERBASE: $BROWSERBASE"
echo ""
echo "Run tasks with:"
echo "  cd $SCRIPT_DIR && npx tsx scripts/run-task.ts"
echo ""
