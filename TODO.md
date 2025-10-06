# TODO: Make Email Sending Functional

## Tasks
- [x] Add EmailModule to app.module.ts imports
- [x] Add EmailModule to contributions.module.ts imports
- [x] Inject MailService into ContributionsService
- [x] Implement sendContributionReminders method in ContributionsService to send reminder emails
- [ ] Test email sending (requires SMTP config in .env)
- [x] Run build to check for compilation errors (successful)

## Notes
- Users service already has email sending implemented for role/status updates
- SMTP config needed: email.host, email.port, email.user, email.pass, email.from
