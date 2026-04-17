# Security Specification: StadiumFlow Intel

## Adversarial Threat Model

### 1. Identity Spoofing (Bypass)
- **Threat**: Attacker attempts to write a message to another user's chat collection.
- **Countermeasure**: Firestore rules enforce `userId` check against `request.auth.uid`.

### 2. State Shortcutting
- **Threat**: Attacker attempts to mark an incident as "RESOLVED" without authorization.
- **Countermeasure**: Incidents are strictly immutable in Firestore (`allow update: if false`).

### 3. Resource Poisoning (Denial of Wallet)
- **Threat**: Attacker injects 1MB of junk into the `msg` field of an incident.
- **Countermeasure**: Max size limits for all string fields in rules (e.g., `data.msg.size() <= 500`).

## The "Dirty Dozen" Payloads (Rejected)

| Payload ID | Target Path | Violation | result |
|---|---|---|---|
| P-01 | /incidents/1 | Unauthenticated Write | PERMISSION_DENIED |
| P-02 | /users/attacker/chats/1 | Spoofed `userId` | PERMISSION_DENIED |
| P-03 | /users/victim/chats/1 | Cross-User Access | PERMISSION_DENIED |
| P-04 | /telemetry/live | Unauthorized Update | PERMISSION_DENIED |
| P-05 | /incidents/2 | Missing `createdAt` | PERMISSION_DENIED |
| P-06 | /incidents/3 | Future `createdAt` | PERMISSION_DENIED |
| P-07 | /users/u/chats/c | 2MB `content` string | PERMISSION_DENIED |
| P-08 | /test/connection | Write Attempt | PERMISSION_DENIED |
| P-09 | /users/u/chats/c | Manual `timestamp` | PERMISSION_DENIED |
| P-10 | /incidents/4 | Invalid `type` enum | PERMISSION_DENIED |
| P-11 | /incidents/5 | ID too long (>128) | PERMISSION_DENIED |
| P-12 | /users/u/chats/c | Deleted metadata | PERMISSION_DENIED |

## Operational Hardening
- **Zero Secrets**: All keys are managed via platform environment.
- **Zero XSS**: No use of `dangerouslySetInnerHTML`.
- **Zero SQLi**: No raw query builders; strictly typed Firestore SDK.
