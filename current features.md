# Current Features

This document lists features currently represented by the frontend pages, backend controllers/services, persistence model, and automated tests in the repository.

## Public and Authentication Features

- Public landing page.
- User registration with full name, email, phone, password, and confirmation password.
- Login using email and password.
- JWT token generation and validation.
- Current-user/session lookup.
- Logout/session handling through the frontend authentication context.
- Change-password flow.
- Forgot-password flow that creates a time-limited reset token.
- Password reset using a valid reset token.
- BCrypt password hashing.
- Temporary account lockout after five consecutive failed login attempts.
- Account active/deactivated checks during login.
- Automatic linking of pending nominee records when a registered account matches the nominee email.
- Role-aware redirects and protected frontend routes.

## Document Vault Features

- Upload individual documents through multipart requests.
- Bulk document upload.
- File-size and file-type validation utilities.
- Filename sanitization to reduce path traversal risk.
- MIME-type and file metadata extraction using Apache Tika.
- AES-256-GCM encryption before local file storage.
- Decryption for authenticated preview and download.
- SHA-256 checksum generation and persistence.
- Document metadata including title, original filename, MIME type, size, notes, expiry date, favorite status, category, folder, and tags.
- Document list retrieval with filtering by category, folder, favorite status, search, and deleted state through the document service/controller layer.
- Document details view.
- In-browser file preview flow.
- File download flow.
- Edit document metadata.
- Favorite/unfavorite documents.
- Soft-delete documents.
- Restore soft-deleted documents.
- Permanent document deletion.
- Document version upload and version history retrieval.
- Custom vault folders with name and color.
- Folder creation, listing, and deletion.
- System/user categories and tag lookup support.

## Nominee and Digital Legacy Features

- Add/designate a nominee with name, email, phone, relationship, and notes.
- List nominee designations.
- View an individual nominee.
- Update nominee details.
- Remove a nominee designation.
- Resend nominee invitations.
- Accept nominee invitations through a tokenized public route.
- Track nominee verification status.
- Nominee dashboard.
- Nominee view of documents granted through approved emergency access.
- Nominee emergency-request submission page.
- Nominee emergency-request history page.

## Policy Engine Features

- Create emergency-access policies.
- Bind a policy to a specific nominee.
- Bind one or more vault documents to a policy.
- Configure policy description.
- Configure waiting period in hours.
- Configure approval type.
- Configure access duration in hours.
- Configure policy expiry date.
- Enable or disable a policy.
- Update policy settings and linked documents.
- Delete policies.
- List owner policies.
- List active policies available to the authenticated nominee.
- Notify the owner when a policy is created.

## Emergency Access Features

- Nominees can submit an emergency request for an available active policy.
- Emergency request reason is recorded.
- Supporting evidence can be uploaded as an encrypted file.
- Owners can list their emergency requests.
- Nominees can list their own emergency requests.
- Administrators can list system emergency requests.
- Owner/admin review flow with approval or rejection and review notes.
- Request cancellation.
- Waiting-period tracking.
- Approved-request access expiration tracking.
- Retrieval of documents accessible to the nominee for an approved request.
- Scheduled processing for expired emergency access.
- Scheduled processing for automatic approval timeouts.

## Dashboard, Readiness, Risk, and Reporting Features

- User dashboard with vault and workflow information.
- Digital readiness score calculation and persistence.
- Risk score calculation and persistence.
- Risk factors and improvement suggestions based on vault state, nominees, policies, document expiry, authentication hygiene, and failed logins.
- Readiness page with readiness assessment data.
- Risk page with risk assessment data.
- Reports page with document/policy/nominee/request statistics.
- PDF report generation through OpenPDF.
- Document expiry checks and expiry-related scheduled processing.

## Notifications and Audit Features

- User notification creation for supported workflow events.
- Notification listing.
- Unread notification count.
- Mark one notification as read.
- Mark all notifications as read.
- Delete one notification.
- Clear all notifications.
- Activity log creation for authentication, vault, policy, nominee, and administrative actions.
- User activity log listing with pagination support.
- Recent activity log retrieval.
- Admin system-log listing.
- Frontend notification drawer and toast-style feedback.

## Administrator Features

- Administrator dashboard.
- System totals for users, active users, documents, storage, policies, and emergency requests.
- System category breakdown.
- Recent-user listing.
- User-management page with filtering.
- Per-user document, nominee, and policy counts.
- Activate or deactivate user accounts.
- Protection against deactivating administrative accounts.
- Administrator emergency-request review page.
- Administrator system audit-log page.

## Frontend Experience Features

- Separate public authentication layout and authenticated main layout.
- Role-specific navigation for users, nominees, and administrators.
- Protected routes with loading state while authentication is resolved.
- Automatic redirect to the appropriate portal when a user accesses a route outside their role.
- Reusable modals, confirmation dialogs, badges, empty states, loading spinners, stat cards, navigation, and modal workflows.
- Dark-themed responsive interface with theme context support.
- Dashboard visualizations including readiness gauge and risk radar components.

## Database and Backend Support

- JPA entities and repositories for users, roles, documents, document versions, folders, categories, tags, nominees, nominee invitations, nominee permissions, policies, policy-document links, emergency requests, emergency evidence, activity logs, notifications, readiness assessments, and risk scores.
- H2 file database for the default local profile.
- MySQL profile and full MySQL schema script.
- Automatic JPA schema updates through the configured development profiles.
- Centralized API response DTOs and paged response support.
- Centralized exception handling for validation, authorization, missing resources, storage, and security failures.
- CORS/web MVC configuration support.

## Automated Verification Present in the Repository

- AES-256-GCM encrypt/decrypt round-trip test.
- Verification that repeated encryption uses different random IVs.
- Tampered ciphertext rejection test.
- BCrypt password hashing and matching test.
- JWT generation and validation test.
- Filename sanitization test.
- SHA-256 checksum-format test.

## Current Implementation Notes

- H2 is configured as the active default profile; MySQL is available through the `mysql` profile.
- Local encrypted files and the H2 database are present under storage directories in the repository workspace.
- The data model includes a `two_factor_enabled` field and risk logic checks it, but the visible routes/services do not currently provide a complete two-factor enrollment and verification workflow.
- Password-reset tokens are generated by the backend and accepted by the reset page; an external email-delivery integration is not present in the inspected source.
- Production deployment should replace development fallback secrets with environment-managed secrets and should add HTTPS, backups, access monitoring, and an appropriate external notification/email provider.
