package httpapi

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/goldiran-app/goldiran-workspace/apps/api/internal/domain"
)

func (a *API) ListIssues(w http.ResponseWriter, r *http.Request) {
	projectID := r.URL.Query().Get("projectId")
	var filter *string
	if projectID != "" {
		filter = &projectID
	}
	items, err := a.Store.ListIssues(r.Context(), filter)
	if err != nil {
		writeError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, items)
}

func (a *API) GetIssue(w http.ResponseWriter, r *http.Request) {
	item, err := a.Store.GetIssue(r.Context(), chi.URLParam(r, "id"))
	if err != nil {
		writeError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, item)
}

func (a *API) CreateIssue(w http.ResponseWriter, r *http.Request) {
	var in domain.IssueInput
	if err := decodeJSON(r, &in); err != nil {
		writeError(w, err)
		return
	}
	item, err := a.Store.CreateIssue(r.Context(), in)
	if err != nil {
		writeError(w, err)
		return
	}
	writeJSON(w, http.StatusCreated, item)
}

func (a *API) UpdateIssue(w http.ResponseWriter, r *http.Request) {
	var in domain.IssueInput
	if err := decodeJSON(r, &in); err != nil {
		writeError(w, err)
		return
	}
	item, err := a.Store.UpdateIssue(r.Context(), chi.URLParam(r, "id"), in)
	if err != nil {
		writeError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, item)
}

func (a *API) DeleteIssue(w http.ResponseWriter, r *http.Request) {
	if err := a.Store.DeleteIssue(r.Context(), chi.URLParam(r, "id")); err != nil {
		writeError(w, err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
