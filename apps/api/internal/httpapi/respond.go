package httpapi

import (
	"encoding/json"
	"errors"
	"net/http"

	"github.com/goldiran-app/goldiran-workspace/apps/api/internal/store"
)

type envelope struct {
	Data  any    `json:"data,omitempty"`
	Error string `json:"error,omitempty"`
}

func writeJSON(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(envelope{Data: payload})
}

func writeError(w http.ResponseWriter, err error) {
	status := http.StatusInternalServerError
	message := "internal error"
	switch {
	case errors.Is(err, store.ErrNotFound):
		status = http.StatusNotFound
		message = "not found"
	case errors.Is(err, store.ErrInvalid):
		status = http.StatusBadRequest
		message = "invalid input"
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(envelope{Error: message})
}

func decodeJSON(r *http.Request, dest any) error {
	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()
	if err := decoder.Decode(dest); err != nil {
		return store.ErrInvalid
	}
	return nil
}
