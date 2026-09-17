# Infra

Docker Compose at the repository root starts PostgreSQL, the Go API, and the Next.js app.

PostgreSQL data is stored in the named volume `postgres_data` and is not committed.
