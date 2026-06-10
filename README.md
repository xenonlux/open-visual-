# AetherForge: Standalone Low-Code & Visual Compiler Platform

AetherForge is a standalone, production-ready frontend and backend visual compiler platform built from scratch in React, TypeScript, and Node.js. It features zero runtime dependencies on proprietary low-code platforms (such as Webflow or bubble-io) or third-party visual canvas block engines (such as GrapesJS).

## 🚀 Key Architectural Capabilities

1. **Virtual DOM Canvas**: Interactive absolute and relative canvas styled recursively, featuring real-time layouts drag-dropping, snapping coordinates, padding gauges, and viewport limits.
2. **Standard Style Inspecting**: Styles drawers mapping typography, margin structures, borders, box shadow presets, CSS Grids and flex directions.
3. **Scratch Logic workflows**: Block-based trigger event mappings compiling click triggers directly into ES5 JavaScript workflows.
4. **Visual ERD Designer**: Entity-relation visual tables creator with standard database datatypes and constraints compiling to clean Prisma Schemas and Express routes.
5. **Direct Monaco Sandbox**: Inspect and write custom CSS classes and inner HTML, syncing back instantaneously to active layouts.
6. **Gemini AI Assistant**: Text description prompts translated into beautiful visual layout node streams via a server proxy using `gemini-3.5-flash`.
7. **Single-Target Code Compilers**: High-fidelity export bundles delivering pure single-file HTML, Vite-React setups, or whole docker-packaged backend routes.

## ⚙️ Running Locally & Self-Hosting

### Environment Variables
Setup a standard `.env` file at the project root:
```env
GEMINI_API_KEY="your-google-ai-studio-secret-key"
APP_URL="http://localhost:3000"
```

### Via Docker Compose
```bash
docker-compose up --build
```
This boots up the compiler platform Express router on port `3000`, mapping persistent project files securely inside the sandbox.

## 📄 Licence
Licensed under the open-source MIT guidelines. Refer to `LICENSE` and `NOTICE` for copyright declarations.
# open-visual-
