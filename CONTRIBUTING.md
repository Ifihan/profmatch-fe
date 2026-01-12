# Contributing to ProfMatch

Thank you for your interest in contributing to ProfMatch! We welcome contributions of all kinds, from bug fixes to new features. This guide will help you get started.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Types of Contributions](#types-of-contributions)
- [Development Workflow](#development-workflow)
- [Code Standards](#code-standards)
- [Commit Conventions](#commit-conventions)
- [Pull Request Process](#pull-request-process)
- [Reporting Issues](#reporting-issues)
- [Security](#security)
- [Project Structure](#project-structure)

## Code of Conduct

This project adheres to the Contributor Covenant [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to victoriaolusheye@gmail.com.

## Getting Started

### Prerequisites

- Node.js 20 or higher
- npm
- Git

### Local Development Setup

1. **Fork the repository** on GitHub

2. **Clone your fork:**

```bash
git clone https://github.com/YOUR_USERNAME/profmatch-fe.git
cd profmatch-fe
```

3. **Install dependencies:**

```bash
npm install
```

4. **Set up environment variables:**

```bash
cp .env.example .env.local
```

5. **Start the development server:**

```bash
npm run dev
```

6. **Open your browser** and navigate to `http://localhost:3000`

## Types of Contributions

We welcome the following types of contributions:

| Type          | Description                              |
| ------------- | ---------------------------------------- |
| Bug Fixes     | Fix issues and improve stability         |
| New Features  | Add new functionality to the application |
| Documentation | Improve README, code comments, or guides |
| Tests         | Add or improve test coverage             |
| Code Quality  | Refactoring, performance improvements    |
| UI/UX         | Design improvements and accessibility    |
| Security      | Security fixes and improvements          |

## Development Workflow

### Branching Strategy

- Create feature branches from `main`
- Use descriptive branch names following this pattern:
  - `feature/add-search` - for new features
  - `fix/login-error` - for bug fixes
  - `docs/update-readme` - for documentation
  - `refactor/simplify-api` - for refactoring

### Making Changes

1. **Create a new branch:**

```bash
git checkout -b feature/your-feature-name
```

2. **Make your changes** following our code standards

3. **Run linting:**

```bash
npm run lint
```

4. **Run tests:**

```bash
npm run test
```

5. **Build to check for errors:**

```bash
npm run build
```

6. **Commit your changes** using conventional commits

## Code Standards

### TypeScript

- Use TypeScript for all new files
- Define proper types and interfaces
- Avoid using `any` type

### React & Next.js

- Use functional components with hooks
- Follow React best practices
- Use Next.js App Router conventions

### Styling

- Use Tailwind CSS for styling
- Follow existing class naming patterns
- Ensure responsive design

### General

- Write meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused
- Follow DRY (Don't Repeat Yourself) principles

## Commit Conventions

We follow [Conventional Commits](https://www.conventionalcommits.org/). Use the following format:

```bash
<type>: <description>

[optional body]

[optional footer]
```

### Commit Types

| Type       | Description                                       |
| ---------- | ------------------------------------------------- |
| `feat`     | New feature                                       |
| `fix`      | Bug fix                                           |
| `docs`     | Documentation changes                             |
| `style`    | Code style changes (formatting, semicolons, etc.) |
| `refactor` | Code refactoring                                  |
| `perf`     | Performance improvements                          |
| `test`     | Adding or updating tests                          |
| `chore`    | Maintenance tasks                                 |
| `security` | Security fixes                                    |

### Examples

```bash
feat: add professor search functionality
fix: resolve matching algorithm timeout
docs: update API documentation
refactor: simplify match results component
test: add unit tests for useMatch hook
```

### Co-authoring

When collaborating or pair programming, include co-authors:

```bash
feat: add new matching algorithm

Co-authored-by: Name <email@example.com>
```

## Pull Request Process

1. **Ensure your code is ready:**

   - All tests pass (`npm run test`)
   - Linting passes (`npm run lint`)
   - Build succeeds (`npm run build`)

2. **Push your branch:**

```bash
git push origin feature/your-feature-name
```

3. **Open a Pull Request:**

- Use a clear, descriptive title
- Fill out the PR template completely
- Link any related issues

4. **Review process:**

- At least one maintainer approval is required
- All CI checks must pass
- Address feedback promptly

5. **After approval:**

- Your PR will be merged by a maintainer
- Delete your branch after merging

## Reporting Issues

### Before Creating an Issue

- Search existing issues to avoid duplicates
- Check if the issue has already been fixed in `main`

### Bug Reports

Use the bug report template and include:

- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Browser and OS information
- Screenshots if applicable

### Feature Requests

Use the feature request template and include:

- Clear description of the feature
- Why it would be useful
- Possible implementation approach

## Security

If you discover a security vulnerability, please **do not** open a public issue. Instead, report it privately by emailing the maintainers. We take security seriously and will respond promptly.

## Project Structure

```bash
profmatch-fe/
├── src/
│   ├── app/          # Next.js App Router pages
│   ├── components/   # React components
│   ├── hooks/        # Custom React hooks
│   ├── lib/          # Utility functions and API
│   └── types/        # TypeScript type definitions
├── public/           # Static assets
└── __tests__/        # Test files
```

---

## Questions?

If you have questions, feel free to:

- Open a [discussion](https://github.com/Ifihan/profmatch-fe/discussions)
- Create a question issue using the template
- Reach out to the maintainers

---

**Thank you for contributing to ProfMatch!** Your contributions help make this project better for everyone.
