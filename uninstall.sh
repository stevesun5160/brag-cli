#!/usr/bin/env bash

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BIN_DIR="$HOME/.local/bin"

echo -e "${GREEN}🗑️  Uninstalling Brag CLI...${NC}"

# Remove each command
for cmd in brag-add brag-polish brag-sum; do
    TARGET="$BIN_DIR/$cmd"

    if [ -L "$TARGET" ] || [ -f "$TARGET" ]; then
        echo -e "${YELLOW}🗑️  Removing $cmd${NC}"
        rm -f "$TARGET"
    else
        echo -e "${YELLOW}⚠️  $cmd not found, skipping${NC}"
    fi
done

echo -e "\n${GREEN}✅ Uninstallation complete!${NC}"
