# StadiumFlow Security Policy

## Supported Versions

Only the latest `main` branch is supported for security updates.

## Reporting a Vulnerability

We take the security of StadiumFlow seriously. If you find a vulnerability, please do NOT open a public issue. Instead, report it through the platform's standard security channels.

## Tactical Security Protocols

- **Environment Isolation**: All API keys (Gemini, etc.) are managed via environment variables and are never stored in the source code.
- **Sanitization**: The application contains zero usage of `dangerouslySetInnerHTML` or `eval()`.
- **Infrastructure**: The application runs behind a secure reverse proxy on Port 3000.
- **AI Safety**: We use system instructions and structured schemas to prevent prompt injection and ensure data integrity.
