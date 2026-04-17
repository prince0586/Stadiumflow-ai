# Contributing to StadiumFlow

Thank you for your interest in improving StadiumFlow!

## Neural Node Standards

- **TypeScript**: All code must be strongly typed. No `any` types allowed.
- **Components**: Use the `src/components/` directory for UI primitives. Use React 19 patterns.
- **Testing**: All tactical logic in `src/lib/` must have corresponding tests in `src/test/`.
- **Linting**: Ensure `npm run lint` passes before submission.

## Architecture

StadiumFlow is a Pure SPA (Single Page Application). Avoid adding backend dependencies (Express/Node) unless absolutely necessary for complex proxying.
