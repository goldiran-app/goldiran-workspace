package store

import (
	"context"
	"sync"
	"time"

	"github.com/goldiran-app/goldiran-workspace/apps/api/internal/domain"
	"github.com/google/uuid"
)

type Memory struct {
	mu          sync.RWMutex
	initiatives map[string]domain.Initiative
	projects    map[string]domain.Project
	issues      map[string]domain.Issue
}

func NewMemory() *Memory {
	return &Memory{
		initiatives: make(map[string]domain.Initiative),
		projects:    make(map[string]domain.Project),
		issues:      make(map[string]domain.Issue),
	}
}

func (m *Memory) Stats(context.Context) (domain.Stats, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	return domain.Stats{
		Initiatives: len(m.initiatives),
		Projects:    len(m.projects),
		Issues:      len(m.issues),
	}, nil
}

func (m *Memory) ListInitiatives(context.Context) ([]domain.Initiative, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	items := make([]domain.Initiative, 0, len(m.initiatives))
	for _, item := range m.initiatives {
		items = append(items, item)
	}
	return items, nil
}

func (m *Memory) GetInitiative(_ context.Context, id string) (domain.Initiative, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	item, ok := m.initiatives[id]
	if !ok {
		return domain.Initiative{}, ErrNotFound
	}
	return item, nil
}

func (m *Memory) CreateInitiative(_ context.Context, in domain.InitiativeInput) (domain.Initiative, error) {
	if in.Name == "" {
		return domain.Initiative{}, ErrInvalid
	}
	now := time.Now().UTC()
	item := domain.Initiative{
		ID:          uuid.NewString(),
		Name:        in.Name,
		Description: in.Description,
		CreatedAt:   now,
		UpdatedAt:   now,
	}
	m.mu.Lock()
	m.initiatives[item.ID] = item
	m.mu.Unlock()
	return item, nil
}

func (m *Memory) UpdateInitiative(_ context.Context, id string, in domain.InitiativeInput) (domain.Initiative, error) {
	if in.Name == "" {
		return domain.Initiative{}, ErrInvalid
	}
	m.mu.Lock()
	defer m.mu.Unlock()
	item, ok := m.initiatives[id]
	if !ok {
		return domain.Initiative{}, ErrNotFound
	}
	item.Name = in.Name
	item.Description = in.Description
	item.UpdatedAt = time.Now().UTC()
	m.initiatives[id] = item
	return item, nil
}

func (m *Memory) DeleteInitiative(_ context.Context, id string) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	if _, ok := m.initiatives[id]; !ok {
		return ErrNotFound
	}
	delete(m.initiatives, id)
	for projectID, project := range m.projects {
		if project.InitiativeID != nil && *project.InitiativeID == id {
			project.InitiativeID = nil
			m.projects[projectID] = project
		}
	}
	return nil
}

func (m *Memory) ListProjects(_ context.Context, initiativeID *string) ([]domain.Project, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	items := make([]domain.Project, 0)
	for _, item := range m.projects {
		if initiativeID != nil && *initiativeID != "" {
			if item.InitiativeID == nil || *item.InitiativeID != *initiativeID {
				continue
			}
		}
		items = append(items, item)
	}
	return items, nil
}

func (m *Memory) GetProject(_ context.Context, id string) (domain.Project, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	item, ok := m.projects[id]
	if !ok {
		return domain.Project{}, ErrNotFound
	}
	return item, nil
}

func (m *Memory) CreateProject(_ context.Context, in domain.ProjectInput) (domain.Project, error) {
	if in.Name == "" {
		return domain.Project{}, ErrInvalid
	}
	if in.InitiativeID != nil && *in.InitiativeID != "" {
		m.mu.RLock()
		_, ok := m.initiatives[*in.InitiativeID]
		m.mu.RUnlock()
		if !ok {
			return domain.Project{}, ErrInvalid
		}
	}
	now := time.Now().UTC()
	item := domain.Project{
		ID:           uuid.NewString(),
		InitiativeID: in.InitiativeID,
		Name:         in.Name,
		Description:  in.Description,
		CreatedAt:    now,
		UpdatedAt:    now,
	}
	m.mu.Lock()
	m.projects[item.ID] = item
	m.mu.Unlock()
	return item, nil
}

func (m *Memory) UpdateProject(_ context.Context, id string, in domain.ProjectInput) (domain.Project, error) {
	if in.Name == "" {
		return domain.Project{}, ErrInvalid
	}
	m.mu.Lock()
	defer m.mu.Unlock()
	item, ok := m.projects[id]
	if !ok {
		return domain.Project{}, ErrNotFound
	}
	if in.InitiativeID != nil && *in.InitiativeID != "" {
		if _, exists := m.initiatives[*in.InitiativeID]; !exists {
			return domain.Project{}, ErrInvalid
		}
	}
	item.InitiativeID = in.InitiativeID
	item.Name = in.Name
	item.Description = in.Description
	item.UpdatedAt = time.Now().UTC()
	m.projects[id] = item
	return item, nil
}

func (m *Memory) DeleteProject(_ context.Context, id string) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	if _, ok := m.projects[id]; !ok {
		return ErrNotFound
	}
	delete(m.projects, id)
	for issueID, issue := range m.issues {
		if issue.ProjectID == id {
			delete(m.issues, issueID)
		}
	}
	return nil
}

func (m *Memory) ListIssues(_ context.Context, projectID *string) ([]domain.Issue, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	items := make([]domain.Issue, 0)
	for _, item := range m.issues {
		if projectID != nil && *projectID != "" && item.ProjectID != *projectID {
			continue
		}
		items = append(items, item)
	}
	return items, nil
}

func (m *Memory) GetIssue(_ context.Context, id string) (domain.Issue, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	item, ok := m.issues[id]
	if !ok {
		return domain.Issue{}, ErrNotFound
	}
	return item, nil
}

func (m *Memory) CreateIssue(_ context.Context, in domain.IssueInput) (domain.Issue, error) {
	if in.Title == "" || in.ProjectID == "" {
		return domain.Issue{}, ErrInvalid
	}
	status := in.Status
	if status == "" {
		status = "open"
	}
	if !validIssueStatus(status) {
		return domain.Issue{}, ErrInvalid
	}
	m.mu.RLock()
	_, ok := m.projects[in.ProjectID]
	m.mu.RUnlock()
	if !ok {
		return domain.Issue{}, ErrInvalid
	}
	now := time.Now().UTC()
	item := domain.Issue{
		ID:          uuid.NewString(),
		ProjectID:   in.ProjectID,
		Title:       in.Title,
		Description: in.Description,
		Status:      status,
		CreatedAt:   now,
		UpdatedAt:   now,
	}
	m.mu.Lock()
	m.issues[item.ID] = item
	m.mu.Unlock()
	return item, nil
}

func (m *Memory) UpdateIssue(_ context.Context, id string, in domain.IssueInput) (domain.Issue, error) {
	if in.Title == "" || in.ProjectID == "" {
		return domain.Issue{}, ErrInvalid
	}
	status := in.Status
	if status == "" {
		status = "open"
	}
	if !validIssueStatus(status) {
		return domain.Issue{}, ErrInvalid
	}
	m.mu.Lock()
	defer m.mu.Unlock()
	item, ok := m.issues[id]
	if !ok {
		return domain.Issue{}, ErrNotFound
	}
	if _, exists := m.projects[in.ProjectID]; !exists {
		return domain.Issue{}, ErrInvalid
	}
	item.ProjectID = in.ProjectID
	item.Title = in.Title
	item.Description = in.Description
	item.Status = status
	item.UpdatedAt = time.Now().UTC()
	m.issues[id] = item
	return item, nil
}

func (m *Memory) DeleteIssue(_ context.Context, id string) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	if _, ok := m.issues[id]; !ok {
		return ErrNotFound
	}
	delete(m.issues, id)
	return nil
}
