# AgentOps AI Studio — Developer Guide

## Introduction
Welcome to the AgentOps AI Studio Developer Guide. This document provides step-by-step instructions on setting up your local environment, running verification tests, and adhering to our strict enterprise quality and coding standards.

---

## 1. System Requirements
- **Node.js:** v18.x or v20.x (v20.x recommended)
- **Package Manager:** npm (v10.x or above)
- **Docker:** (Optional, for containerized environments)

---

## 2. Local Environment Setup
To initialize your local workspace, run:
```bash
# Clone the repository
git clone https://github.com/user/agentops-ai-studio.git
cd agentops-ai-studio

# Install dependencies with legacy peer resolutions
npm install --legacy-peer-deps

# Spin up the hot-reloading Next.js server
npm run dev
```
The server will boot on `http://localhost:3000`.

---

## 3. Mandatory Development Scripts
We enforce rigorous code quality and typing standards. Ensure you run and satisfy these commands before committing:

### A. Run Linting
We maintain a zero-warning rule. Run ESLint checks:
```bash
npm run lint
```

### B. Run Formatting
We use Prettier with automated Tailwind CSS class sorting. Format all files before pushing:
```bash
npx prettier --write .
```

### C. Run Type Checks
TypeScript must compile with zero errors:
```bash
npx tsc --noEmit
```

### D. Run Automated Test Suite
Ensure all 55+ unit and integration tests pass perfectly:
```bash
# Run all tests
npm run test

# Run tests with active coverage reports
npm run test:coverage
```

### E. Production Build Compile
Run a complete Next.js production build to verify compilation output:
```bash
npm run build
```

---

## 4. Docker Guide

### Run Production Profile
To build and run the optimized production container locally:
```bash
docker-compose up --build
```
Access the production application on port `3000`.

### Run Development Profile (with Hot-Reloading)
To spin up a development container that mounts your local directory:
```bash
docker-compose -f docker-compose.dev.yml up --build
```
This runs hot-reloading using Alpine Node containers.
