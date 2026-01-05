# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Brag CLI is a TypeScript-based CLI tool that helps engineers track daily work and generate performance review materials using Google Gemini AI. The tool consists of three main commands that work together to create a workflow from daily logging to monthly summaries.

## Development Commands

### Essential Commands
```bash
# Install dependencies
pnpm install

# Build TypeScript to dist/
pnpm build

# Run tests
pnpm test              # Run all tests once
pnpm test:watch        # Watch mode for development
pnpm test:coverage     # Generate coverage report

# Development mode (no compilation needed, uses tsx)
pnpm dev:add "content"     # Test brag-add command
pnpm dev:polish            # Test brag-polish command
pnpm dev:sum 2026-01       # Test brag-sum command
```

### Running a Single Test File
```bash
pnpm vitest src/utils/date.test.ts
pnpm vitest src/utils/file.test.ts --run  # Run once without watch
```

### Local Installation

**Option 1: Using install script (recommended for Volta users)**
```bash
./install.sh
# Installs to ~/.local/bin
# Follow the instructions to add ~/.local/bin to PATH if needed

# To uninstall:
./uninstall.sh
```

**Option 2: Using npm (if not using Volta)**
```bash
pnpm build
npm link
# Now can use: brag-add, brag-polish, brag-sum anywhere
```

## Architecture

### Module Organization

The codebase follows a layered architecture:

```
src/
├── cli/           # Entry points for three commands (add, polish, sum)
├── utils/         # Pure utility functions (date, file, markdown)
├── ai/            # AI integration layer (gemini client, prompts)
├── types/         # Shared TypeScript interfaces
└── config.ts      # Environment configuration and validation
```

**Key architectural decisions:**

1. **Separation of Concerns**: CLI commands (`src/cli/`) orchestrate workflows but delegate to utility modules. They handle user I/O and error display.

2. **Utility Layer**: Pure functions in `src/utils/` are stateless and testable. Each utility module has a corresponding `.test.ts` file in the same directory.

3. **AI Layer**: Isolated in `src/ai/` with two components:
   - `prompts.ts`: Template functions that generate prompts (pure functions)
   - `gemini.ts`: Client wrapper for Google GenAI SDK (stateful singleton)

4. **Type Safety**: All modules use explicit TypeScript types defined in `src/types/index.ts`. Strict mode is enabled.

### Data Flow

**brag-add flow:**
```
CLI input → date.getToday() → file operations → markdown.appendToSection()
```

**brag-polish flow:**
```
CLI input → file.readFile() → markdown.extractSection() →
prompts.createPolishPrompt() → gemini.generateContent() → file.writeFile()
```

**brag-sum flow:**
```
CLI input → date.getMonthLogs() → read multiple files →
prompts.createSummaryPrompt() → gemini.generateContent() → file.writeFile()
```

### Configuration System

`config.ts` uses environment variables with fallbacks:
- `GEMINI_API_KEY`: Required for AI features (validated via `validateConfig()`)
- `LOGS_DIR`: Defaults to `./logs`
- `SUMMARIES_DIR`: Defaults to `./summaries`
- `templatesDir`: Hardcoded to `./templates`

The config object is a singleton exported directly, accessed by importing `{ config }`.

### Markdown Processing

The `markdown.ts` module treats each `##` heading as a section. Key functions:
- `findSection()`: Returns `SectionInfo` with line numbers and content
- `appendToSection()`: Adds content while preserving formatting
- `replaceSection()`: Replaces entire section content
- `extractSection()`: Returns content without the heading

All functions preserve frontmatter and formatting.

### Testing Strategy

- **Test Location**: `.test.ts` files colocated with source files
- **Fixtures**: Test data in `src/utils/__fixtures__/` for integration tests
- **Mocking**: Uses Vitest's `vi` for mocking file system and config in tests
- **Coverage Target**: Maintain high coverage for utility modules

### Build System

- **Source**: TypeScript in `src/` (ES2022, strict mode)
- **Output**: Compiled JS in `dist/` (ES Modules)
- **Executables**: `bin/*.js` files import from `dist/cli/`
- **Type Checking**: Run `tsc --noEmit` to check types without building

### AI Prompt Engineering

Prompts in `src/ai/prompts.ts` are designed to:
- Output raw Markdown (no explanations)
- Preserve frontmatter and structure
- Use繁體中文 for content
- Avoid AI-sounding phrases ("顯著", "有效地", "成功地")
- Follow STAR principle for work items
- Categorize content into predefined sections

When modifying prompts, ensure they maintain the template structure and output format.

ALWAYS thinking in English when writing prompts, but the output must be in zh-TW.

## Important Patterns

### Error Handling
All CLI commands catch errors and display user-friendly messages before `process.exit(1)`. Utility functions throw descriptive errors that CLI commands catch and display.

### File Paths
Use `join()` from `path` module for all path operations. Config paths are resolved relative to project root, not `dist/`.

### Async/Await
All file operations use `fs/promises` with async/await. No callbacks or sync operations.

### TypeScript Imports
Always use `.js` extension in import paths (e.g., `from './config.js'`) even though source files are `.ts`. This is required for ES Modules.
