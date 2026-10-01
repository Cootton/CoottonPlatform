# Cootton GitHub setup

Applied 2026-10-01. See section 112 of COOTTON_WORKING_V001.md for the complete configuration and operating workflow.

Protected main: PR required; GitHub Actions verify required; branch up to date; conversations resolved; admins cannot bypass; no force pushes or deletion. External fork workflows require approval. CI tokens are read-only. Dependency/malware alerts, security update PRs, secret/push protection, private vulnerability reporting and CodeQL default setup are enabled. No deployment credentials were added by this setup.

Security update PRs require the same checks and review of the change before merging. General version updates remain disabled. CodeQL findings must be inspected; enabling scans does not establish absence of vulnerabilities.
