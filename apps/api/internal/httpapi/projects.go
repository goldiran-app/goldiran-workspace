package httpapi

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/goldiran-app/goldiran-workspace/apps/api/internal/domain"
)

func (a *API) ListProjects(w http.ResponseWriter, r *http.Request) {
	initiativeID := r.URL.Query().Get("initiativeId")
	var filter *string
	if initiativeID != "" {
		filter = &initiativeID
	}
	items, err := a.Store.ListProjects(r.Context(), filter)
	if err != nil {
		writeError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, items)
}

func (a *API) GetProject(w http.ResponseWriter, r *http.Request) {
	item, err := a.Store.GetProject(r.Context(), chi.URLParam(r, "id"))
	if err != nil {
		writeError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, item)
}

func (a *API) CreateProject(w http.ResponseWriter, r *http.Request) {
	var in domain.ProjectInput
	if err := decodeJSON(r, &in); err != nil {
		writeError(w, err)
		return
	}
	item, err := a.Store.CreateProject(r.Context(), in)
	if err != nil {
		writeError(w, err)
		return
	}
	writeJSON(w, http.StatusCreated, item)
}

func (a *API) UpdateProject(w http.ResponseWriter, r *http.Request) {
	var in domain.ProjectInput
	if err := decodeJSON(r, &in); err != nil {
		writeError(w, err)
		return
	}
	item, err := a.Store.UpdateProject(r.Context(), chi.URLParam(r, "id"), in)
	if err != nil {
		writeError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, item)
}

func (a *API) DeleteProject(w http.ResponseWriter, r *http.Request) {
	if err := a.Store.DeleteProject(r.Context(), chi.URLParam(r, "id")); err != nil {
		writeError(w, err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (a *API) ListProjectIssues(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if _, err := a.Store.GetProject(r.Context(), id); err != nil {
		writeError(w, err)
		return
	}
	items, err := a.Store.ListIssues(r.Context(), &id)
	if err != nil {
		writeError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, items)
}
