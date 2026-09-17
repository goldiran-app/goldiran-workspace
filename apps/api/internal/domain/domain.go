package domain

import "time"

type Initiative struct {
	ID          string    `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

type Project struct {
	ID           string    `json:"id"`
	InitiativeID *string   `json:"initiativeId"`
	Name         string    `json:"name"`
	Description  string    `json:"description"`
	CreatedAt    time.Time `json:"createdAt"`
	UpdatedAt    time.Time `json:"updatedAt"`
}

type Issue struct {
	ID          string    `json:"id"`
	ProjectID   string    `json:"projectId"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	Status      string    `json:"status"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

type Stats struct {
	Initiatives int `json:"initiatives"`
	Projects    int `json:"projects"`
	Issues      int `json:"issues"`
}

type InitiativeInput struct {
	Name        string `json:"name"`
	Description string `json:"description"`
}

type ProjectInput struct {
	InitiativeID *string `json:"initiativeId"`
	Name         string  `json:"name"`
	Description  string  `json:"description"`
}

type IssueInput struct {
	ProjectID   string `json:"projectId"`
	Title       string `json:"title"`
	Description string `json:"description"`
	Status      string `json:"status"`
}
