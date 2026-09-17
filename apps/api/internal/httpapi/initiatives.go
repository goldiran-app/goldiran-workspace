package httpapi

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/goldiran-app/goldiran-workspace/apps/api/internal/domain"
)

func (a *API) ListInitiatives(w http.ResponseWriter, r *http.Request) {
	items, err := a.Store.ListInitiatives(r.Context())
	if err != nil {
		writeError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, items)
}

func (a *API) GetInitiative(w http.ResponseWriter, r *http.Request) {
	item, err := a.Store.GetInitiative(r.Context(), chi.URLParam(r, "id"))
	if err != nil {
		writeError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, item)
}

func (a *API) CreateInitiative(w http.ResponseWriter, r *http.Request) {
	var in domain.InitiativeInput
	if err := decodeJSON(r, &in); err != nil {
		writeError(w, err)
		return
	}
	item, err := a.Store.CreateInitiative(r.Context(), in)
	if err != nil {
		writeError(w, err)
		return
	}
	writeJSON(w, http.StatusCreated, item)
}

func (a *API) UpdateInitiative(w http.ResponseWriter, r *http.Request) {
	var in domain.InitiativeInput
	if err := decodeJSON(r, &in); err != nil {
		writeError(w, err)
		return
	}
	item, err := a.Store.UpdateInitiative(r.Context(), chi.URLParam(r, "id"), in)
	if err != nil {
		writeError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, item)
}

func (a *API) DeleteInitiative(w http.ResponseWriter, r *http.Request) {
	if err := a.Store.DeleteInitiative(r.Context(), chi.URLParam(r, "id")); err != nil {
		writeError(w, err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (a *API) ListInitiativeProjects(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if _, err := a.Store.GetInitiative(r.Context(), id); err != nil {
		writeError(w, err)
		return
	}
	items, err := a.Store.ListProjects(r.Context(), &id)
	if err != nil {
		writeError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, items)
}
