# LifeLedger+

## Project Description

LifeLedger+ is a secure digital legacy and personal document management platform. It gives users a private vault for important personal, legal, medical, financial, and identity documents while providing controlled emergency access for trusted nominees.

The platform combines encrypted document storage, nominee management, configurable emergency-access policies, auditability, readiness scoring, risk assessment, reporting, and administrator oversight in one application.

## Main Objectives

- Protect sensitive documents in an authenticated digital vault.
- Allow users to organize, search, preview, download, version, and manage documents.
- Let users designate trusted nominees who may request access during an emergency.
- Enforce access rules such as waiting periods, approval types, access duration, expiry dates, and selected documents.
- Provide users with actionable readiness and security-risk information.
- Maintain activity and administrative audit records for important actions.
- Give administrators visibility into users, storage, documents, policies, and emergency requests.

## User Roles

### Regular User / Vault Owner

The owner manages the vault, uploads and organizes documents, designates nominees, creates emergency policies, reviews emergency requests, monitors readiness and risk, and exports reports.

### Nominee

A nominee is a trusted person invited by a vault owner. After accepting the invitation and signing in, the nominee can view assigned documents, submit emergency-access requests with a reason and optional evidence, and review request history.

### Administrator

An administrator uses the separate admin console to review system-level metrics, manage user activation status, review emergency requests, and inspect system audit logs.

## Application Architecture

### Frontend

- React 19 with Vite.
- React Router for public, user, nominee, and admin routes.
- Tailwind CSS for styling.
- Axios-based service layer for backend communication.
- Recharts and custom visual components for dashboard, risk, readiness, and report displays.
- Context providers for authentication, notifications, and theme state.

### Backend

- Java 21 with Spring Boot 3.3.4.
- Spring Web REST controllers.
- Spring Data JPA repositories.
- Spring Security with JWT authentication and role-based authorization.
- Bean validation and centralized exception handling.
- Apache Tika for file metadata and MIME extraction.
- OpenPDF for PDF report generation.
- Local filesystem storage for encrypted vault and evidence files.

### Persistence and Storage

- MySQL 8 is supported through the `mysql` Spring profile.
- H2 file-based storage is the active default profile for local development and testing.
- The SQL schema is available in `database/schema.sql`.
- Encrypted vault files are stored under the configured vault directory and emergency evidence files under the configured evidence directory.
- Database records contain document metadata, encrypted file paths, checksums, versions, ownership, folder/category relationships, and audit information.

## Security Model

LifeLedger+ uses JWT access tokens, BCrypt password hashing, role-based route protection, account activation checks, and temporary account lockout after repeated failed login attempts. Uploaded files are encrypted using AES-256-GCM with a randomly generated initialization vector and authenticated encryption tag. SHA-256 checksums are stored for file integrity verification, and filenames are sanitized before storage.

Access is ownership-aware: users can access their own vault resources, nominees receive only policy-authorized documents after an approved request, and administrators have selected system-level capabilities. Important actions are recorded in activity logs with resource, details, IP address, and user-agent information where available.

## Emergency Access Concept

An owner creates a policy connecting a nominee to selected documents. The policy can specify a waiting period, approval type, access duration, and expiry date. The nominee can then submit a request describing the emergency and attach evidence. The request can be reviewed by the owner or an authorized administrator according to the configured policy. Approved access is time-limited, and scheduled backend tasks process access expiration, automatic approval timeouts, and document-expiration checks.

## Project Structure

```text
LifeLedger/
├── backend/      Spring Boot API, security, services, persistence, and tests
├── frontend/     React/Vite user interface
├── database/     MySQL schema
├── postman/      LifeLedger API collection
└── storage/      Local H2 database and encrypted vault files
```

## Runtime Configuration

- Backend HTTP port: `8080`.
- Default active profile: `h2`.
- Maximum uploaded file size: `50 MB` per file.
- Maximum multipart request size: `55 MB`.
- Default JWT expiration: `24 hours`, configurable through environment variables.
- Vault and evidence paths, JWT secret, and encryption key are configurable through environment variables.

## Intended Use

LifeLedger+ is intended for individuals or families who need a structured, secure way to preserve important digital records and define how trusted people can access selected information when an emergency occurs. It is a software project and should be deployed with production-grade secret management, HTTPS, backups, monitoring, and a configured email or notification delivery system before handling real sensitive data.

