package store

import (
	"context"
	"errors"

	"github.com/goldiran-app/goldiran-workspace/apps/api/internal/domain"
	"github.com/google/uuid"
)

var (
	ErrNotFound = errors.New("not found")
	ErrInvalid  = errors.New("invalid input")
)

type Store interface {
	Stats(ctx context.Context) (domain.Stats, error)

	ListInitiatives(ctx context.Context) ([]domain.Initiative, error)
	GetInitiative(ctx context.Context, id string) (domain.Initiative, error)
	CreateInitiative(ctx context.Context, in domain.InitiativeInput) (domain.Initiative, error)
	UpdateInitiative(ctx context.Context, id string, in domain.InitiativeInput) (domain.Initiative, error)
	DeleteInitiative(ctx context.Context, id string) error

	ListProjects(ctx context.Context, initiativeID *string) ([]domain.Project, error)
	GetProject(ctx context.Context, id string) (domain.Project, error)
	CreateProject(ctx context.Context, in domain.ProjectInput) (domain.Project, error)
	UpdateProject(ctx context.Context, id string, in domain.ProjectInput) (domain.Project, error)
	DeleteProject(ctx context.Context, id string) error

	ListIssues(ctx context.Context, projectID *string) ([]domain.Issue, error)
	GetIssue(ctx context.Context, id string) (domain.Issue, error)
	CreateIssue(ctx context.Context, in domain.IssueInput) (domain.Issue, error)
	UpdateIssue(ctx context.Context, id string, in domain.IssueInput) (domain.Issue, error)
	DeleteIssue(ctx context.Context, id string) error
}

func parseID(id string) (uuid.UUID, error) {
	parsed, err := uuid.Parse(id)
	if err != nil {
		return uuid.Nil, ErrInvalid
	}
	return parsed, nil
}

func optionalID(value *string) (*uuid.UUID, error) {
	if value == nil || *value == "" {
		return nil, nil
	}
	parsed, err := uuid.Parse(*value)
	if err != nil {
		return nil, ErrInvalid
	}
	return &parsed, nil
}

func validIssueStatus(status string) bool {
	switch status {
	case "open", "in_progress", "done":
		return true
	default:
		return false
	}
}
