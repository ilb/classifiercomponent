# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build and Development Commands
- `npm run dev` - Start dev server on port 3010
- `npm run build` - Build the application
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Run ESLint with auto-fix
- Test: `npx jest [filepath]` - Run specific test

## Code Style Guidelines
- Use ESLint and Prettier for code formatting
- Semi-colons are required
- Tab width: 2 spaces
- Print width: 100 characters
- Single quotes for strings
- No trailing commas
- JSX brackets on same line
- React components use .js or .mjs extension
- Server-side code primarily uses .mjs extension
- Follow existing error handling patterns using Errors.mjs
- Use consistent camelCase for variables and methods
- Use PascalCase for components and classes