package store

import (
	"context"
	"errors"
	"strings"

	"github.com/goldiran-app/goldiran-workspace/apps/api/internal/domain"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Postgres struct {
	pool *pgxpool.Pool
}

func NewPostgres(pool *pgxpool.Pool) *Postgres {
	return &Postgres{pool: pool}
}

func (p *Postgres) Stats(ctx context.Context) (domain.Stats, error) {
	var stats domain.Stats
	err := p.pool.QueryRow(ctx, `
		SELECT
			(SELECT COUNT(*) FROM initiatives),
			(SELECT COUNT(*) FROM projects),
			(SELECT COUNT(*) FROM issues)
	`).Scan(&stats.Initiatives, &stats.Projects, &stats.Issues)
	return stats, err
}

func (p *Postgres) ListInitiatives(ctx context.Context) ([]domain.Initiative, error) {
	rows, err := p.pool.Query(ctx, `
		SELECT id, name, description, created_at, updated_at
		FROM initiatives
		ORDER BY created_at DESC
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := make([]domain.Initiative, 0)
	for rows.Next() {
		var item domain.Initiative
		if err := rows.Scan(&item.ID, &item.Name, &item.Description, &item.CreatedAt, &item.UpdatedAt); err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	return items, rows.Err()
}

func (p *Postgres) GetInitiative(ctx context.Context, id string) (domain.Initiative, error) {
	parsed, err := parseID(id)
	if err != nil {
		return domain.Initiative{}, err
	}
	var item domain.Initiative
	err = p.pool.QueryRow(ctx, `
		SELECT id, name, description, created_at, updated_at
		FROM initiatives
		WHERE id = $1
	`, parsed).Scan(&item.ID, &item.Name, &item.Description, &item.CreatedAt, &item.UpdatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return domain.Initiative{}, ErrNotFound
	}
	return item, err
}

func (p *Postgres) CreateInitiative(ctx context.Context, in domain.InitiativeInput) (domain.Initiative, error) {
	if strings.TrimSpace(in.Name) == "" {
		return domain.Initiative{}, ErrInvalid
	}
	var item domain.Initiative
	err := p.pool.QueryRow(ctx, `
		INSERT INTO initiatives (name, description)
		VALUES ($1, $2)
		RETURNING id, name, description, created_at, updated_at
	`, strings.TrimSpace(in.Name), strings.TrimSpace(in.Description)).Scan(
		&item.ID, &item.Name, &item.Description, &item.CreatedAt, &item.UpdatedAt,
	)
	return item, err
}

func (p *Postgres) UpdateInitiative(ctx context.Context, id string, in domain.InitiativeInput) (domain.Initiative, error) {
	parsed, err := parseID(id)
	if err != nil {
		return domain.Initiative{}, err
	}
	if strings.TrimSpace(in.Name) == "" {
		return domain.Initiative{}, ErrInvalid
	}
	var item domain.Initiative
	err = p.pool.QueryRow(ctx, `
		UPDATE initiatives
		SET name = $2, description = $3, updated_at = now()
		WHERE id = $1
		RETURNING id, name, description, created_at, updated_at
	`, parsed, strings.TrimSpace(in.Name), strings.TrimSpace(in.Description)).Scan(
		&item.ID, &item.Name, &item.Description, &item.CreatedAt, &item.UpdatedAt,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return domain.Initiative{}, ErrNotFound
	}
	return item, err
}

func (p *Postgres) DeleteInitiative(ctx context.Context, id string) error {
	parsed, err := parseID(id)
	if err != nil {
		return err
	}
	tag, err := p.pool.Exec(ctx, `DELETE FROM initiatives WHERE id = $1`, parsed)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return ErrNotFound
	}
	return nil
}

func (p *Postgres) ListProjects(ctx context.Context, initiativeID *string) ([]domain.Project, error) {
	var (
		rows pgx.Rows
		err  error
	)
	if initiativeID != nil && *initiativeID != "" {
		parsed, parseErr := parseID(*initiativeID)
		if parseErr != nil {
			return nil, parseErr
		}
		rows, err = p.pool.Query(ctx, `
			SELECT id, initiative_id, name, description, created_at, updated_at
			FROM projects
			WHERE initiative_id = $1
			ORDER BY created_at DESC
		`, parsed)
	} else {
		rows, err = p.pool.Query(ctx, `
			SELECT id, initiative_id, name, description, created_at, updated_at
			FROM projects
			ORDER BY created_at DESC
		`)
	}
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := make([]domain.Project, 0)
	for rows.Next() {
		var item domain.Project
		if err := rows.Scan(&item.ID, &item.InitiativeID, &item.Name, &item.Description, &item.CreatedAt, &item.UpdatedAt); err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	return items, rows.Err()
}

func (p *Postgres) GetProject(ctx context.Context, id string) (domain.Project, error) {
	parsed, err := parseID(id)
	if err != nil {
		return domain.Project{}, err
	}
	var item domain.Project
	err = p.pool.QueryRow(ctx, `
		SELECT id, initiative_id, name, description, created_at, updated_at
		FROM projects
		WHERE id = $1
	`, parsed).Scan(&item.ID, &item.InitiativeID, &item.Name, &item.Description, &item.CreatedAt, &item.UpdatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return domain.Project{}, ErrNotFound
	}
	return item, err
}

func (p *Postgres) CreateProject(ctx context.Context, in domain.ProjectInput) (domain.Project, error) {
	if strings.TrimSpace(in.Name) == "" {
		return domain.Project{}, ErrInvalid
	}
	initiativeID, err := optionalID(in.InitiativeID)
	if err != nil {
		return domain.Project{}, err
	}
	var item domain.Project
	err = p.pool.QueryRow(ctx, `
		INSERT INTO projects (initiative_id, name, description)
		VALUES ($1, $2, $3)
		RETURNING id, initiative_id, name, description, created_at, updated_at
	`, initiativeID, strings.TrimSpace(in.Name), strings.TrimSpace(in.Description)).Scan(
		&item.ID, &item.InitiativeID, &item.Name, &item.Description, &item.CreatedAt, &item.UpdatedAt,
	)
	if isFK(err) {
		return domain.Project{}, ErrInvalid
	}
	return item, err
}

func (p *Postgres) UpdateProject(ctx context.Context, id string, in domain.ProjectInput) (domain.Project, error) {
	parsed, err := parseID(id)
	if err != nil {
		return domain.Project{}, err
	}
	if strings.TrimSpace(in.Name) == "" {
		return domain.Project{}, ErrInvalid
	}
	initiativeID, err := optionalID(in.InitiativeID)
	if err != nil {
		return domain.Project{}, err
	}
	var item domain.Project
	err = p.pool.QueryRow(ctx, `
		UPDATE projects
		SET initiative_id = $2, name = $3, description = $4, updated_at = now()
		WHERE id = $1
		RETURNING id, initiative_id, name, description, created_at, updated_at
	`, parsed, initiativeID, strings.TrimSpace(in.Name), strings.TrimSpace(in.Description)).Scan(
		&item.ID, &item.InitiativeID, &item.Name, &item.Description, &item.CreatedAt, &item.UpdatedAt,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return domain.Project{}, ErrNotFound
	}
	if isFK(err) {
		return domain.Project{}, ErrInvalid
	}
	return item, err
}

func (p *Postgres) DeleteProject(ctx context.Context, id string) error {
	parsed, err := parseID(id)
	if err != nil {
		return err
	}
	tag, err := p.pool.Exec(ctx, `DELETE FROM projects WHERE id = $1`, parsed)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return ErrNotFound
	}
	return nil
}

func (p *Postgres) ListIssues(ctx context.Context, projectID *string) ([]domain.Issue, error) {
	var (
		rows pgx.Rows
		err  error
	)
	if projectID != nil && *projectID != "" {
		parsed, parseErr := parseID(*projectID)
		if parseErr != nil {
			return nil, parseErr
		}
		rows, err = p.pool.Query(ctx, `
			SELECT id, project_id, title, description, status, created_at, updated_at
			FROM issues
			WHERE project_id = $1
			ORDER BY created_at DESC
		`, parsed)
	} else {
		rows, err = p.pool.Query(ctx, `
			SELECT id, project_id, title, description, status, created_at, updated_at
			FROM issues
			ORDER BY created_at DESC
		`)
	}
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := make([]domain.Issue, 0)
	for rows.Next() {
		var item domain.Issue
		if err := rows.Scan(&item.ID, &item.ProjectID, &item.Title, &item.Description, &item.Status, &item.CreatedAt, &item.UpdatedAt); err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	return items, rows.Err()
}

func (p *Postgres) GetIssue(ctx context.Context, id string) (domain.Issue, error) {
	parsed, err := parseID(id)
	if err != nil {
		return domain.Issue{}, err
	}
	var item domain.Issue
	err = p.pool.QueryRow(ctx, `
		SELECT id, project_id, title, description, status, created_at, updated_at
		FROM issues
		WHERE id = $1
	`, parsed).Scan(&item.ID, &item.ProjectID, &item.Title, &item.Description, &item.Status, &item.CreatedAt, &item.UpdatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return domain.Issue{}, ErrNotFound
	}
	return item, err
}

func (p *Postgres) CreateIssue(ctx context.Context, in domain.IssueInput) (domain.Issue, error) {
	if strings.TrimSpace(in.Title) == "" || strings.TrimSpace(in.ProjectID) == "" {
		return domain.Issue{}, ErrInvalid
	}
	status := in.Status
	if status == "" {
		status = "open"
	}
	if !validIssueStatus(status) {
		return domain.Issue{}, ErrInvalid
	}
	projectID, err := uuid.Parse(in.ProjectID)
	if err != nil {
		return domain.Issue{}, ErrInvalid
	}
	var item domain.Issue
	err = p.pool.QueryRow(ctx, `
		INSERT INTO issues (project_id, title, description, status)
		VALUES ($1, $2, $3, $4)
		RETURNING id, project_id, title, description, status, created_at, updated_at
	`, projectID, strings.TrimSpace(in.Title), strings.TrimSpace(in.Description), status).Scan(
		&item.ID, &item.ProjectID, &item.Title, &item.Description, &item.Status, &item.CreatedAt, &item.UpdatedAt,
	)
	if isFK(err) {
		return domain.Issue{}, ErrInvalid
	}
	return item, err
}

func (p *Postgres) UpdateIssue(ctx context.Context, id string, in domain.IssueInput) (domain.Issue, error) {
	parsed, err := parseID(id)
	if err != nil {
		return domain.Issue{}, err
	}
	if strings.TrimSpace(in.Title) == "" || strings.TrimSpace(in.ProjectID) == "" {
		return domain.Issue{}, ErrInvalid
	}
	status := in.Status
	if status == "" {
		status = "open"
	}
	if !validIssueStatus(status) {
		return domain.Issue{}, ErrInvalid
	}
	projectID, err := uuid.Parse(in.ProjectID)
	if err != nil {
		return domain.Issue{}, ErrInvalid
	}
	var item domain.Issue
	err = p.pool.QueryRow(ctx, `
		UPDATE issues
		SET project_id = $2, title = $3, description = $4, status = $5, updated_at = now()
		WHERE id = $1
		RETURNING id, project_id, title, description, status, created_at, updated_at
	`, parsed, projectID, strings.TrimSpace(in.Title), strings.TrimSpace(in.Description), status).Scan(
		&item.ID, &item.ProjectID, &item.Title, &item.Description, &item.Status, &item.CreatedAt, &item.UpdatedAt,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return domain.Issue{}, ErrNotFound
	}
	if isFK(err) {
		return domain.Issue{}, ErrInvalid
	}
	return item, err
}

func (p *Postgres) DeleteIssue(ctx context.Context, id string) error {
	parsed, err := parseID(id)
	if err != nil {
		return err
	}
	tag, err := p.pool.Exec(ctx, `DELETE FROM issues WHERE id = $1`, parsed)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return ErrNotFound
	}
	return nil
}

func isFK(err error) bool {
	var pgErr *pgconn.PgError
	return errors.As(err, &pgErr) && pgErr.Code == "23503"
}
