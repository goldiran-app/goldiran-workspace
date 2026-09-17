package httpapi

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/goldiran-app/goldiran-workspace/apps/api/internal/store"
)

func NewRouter(s store.Store, corsOrigin string) http.Handler {
	r := chi.NewRouter()
	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{corsOrigin},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
		AllowCredentials: false,
		MaxAge:           300,
	}))

	api := &API{Store: s}

	r.Get("/health", api.Health)
	r.Route("/api/v1", func(r chi.Router) {
		r.Get("/stats", api.Stats)

		r.Get("/initiatives", api.ListInitiatives)
		r.Post("/initiatives", api.CreateInitiative)
		r.Get("/initiatives/{id}", api.GetInitiative)
		r.Put("/initiatives/{id}", api.UpdateInitiative)
		r.Delete("/initiatives/{id}", api.DeleteInitiative)
		r.Get("/initiatives/{id}/projects", api.ListInitiativeProjects)

		r.Get("/projects", api.ListProjects)
		r.Post("/projects", api.CreateProject)
		r.Get("/projects/{id}", api.GetProject)
		r.Put("/projects/{id}", api.UpdateProject)
		r.Delete("/projects/{id}", api.DeleteProject)
		r.Get("/projects/{id}/issues", api.ListProjectIssues)

		r.Get("/issues", api.ListIssues)
		r.Post("/issues", api.CreateIssue)
		r.Get("/issues/{id}", api.GetIssue)
		r.Put("/issues/{id}", api.UpdateIssue)
		r.Delete("/issues/{id}", api.DeleteIssue)
	})

	return r
}

type API struct {
	Store store.Store
}

func (a *API) Health(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}

func (a *API) Stats(w http.ResponseWriter, r *http.Request) {
	stats, err := a.Store.Stats(r.Context())
	if err != nil {
		writeError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, stats)
}
