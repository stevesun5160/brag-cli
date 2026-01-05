#!/usr/bin/env bash

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Get the absolute path of the project directory
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BIN_DIR="$HOME/.local/bin"

echo -e "${GREEN}📦 Installing Brag CLI...${NC}"

# Check if dist directory exists
if [ ! -d "$PROJECT_DIR/dist" ]; then
    echo -e "${YELLOW}⚠️  dist/ not found. Running build...${NC}"
    cd "$PROJECT_DIR"
    pnpm build
fi

# Create ~/.local/bin if it doesn't exist
if [ ! -d "$BIN_DIR" ]; then
    echo -e "${YELLOW}📁 Creating $BIN_DIR${NC}"
    mkdir -p "$BIN_DIR"
fi

# Link each command
for cmd in brag-add brag-polish brag-sum; do
    SOURCE="$PROJECT_DIR/bin/$cmd.js"
    TARGET="$BIN_DIR/$cmd"

    if [ -L "$TARGET" ] || [ -f "$TARGET" ]; then
        echo -e "${YELLOW}🔄 Removing existing $cmd${NC}"
        rm -f "$TARGET"
    fi

    echo -e "${GREEN}🔗 Linking $cmd${NC}"
    ln -s "$SOURCE" "$TARGET"
    chmod +x "$TARGET"
done

echo -e "\n${GREEN}✅ Installation complete!${NC}"

# Check if ~/.local/bin is in PATH
if [[ ":$PATH:" != *":$BIN_DIR:"* ]]; then
    echo -e "\n${YELLOW}⚠️  Warning: $BIN_DIR is not in your PATH${NC}"
    echo -e "Add the following line to your ~/.zshrc or ~/.bashrc:\n"
    echo -e "  ${GREEN}export PATH=\"\$HOME/.local/bin:\$PATH\"${NC}\n"
    echo -e "Then run: ${GREEN}source ~/.zshrc${NC} (or ~/.bashrc)"
else
    echo -e "\n${GREEN}🎉 You can now use: brag-add, brag-polish, brag-sum${NC}"
fi
