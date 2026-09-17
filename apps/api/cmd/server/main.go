package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/goldiran-app/goldiran-workspace/apps/api/internal/config"
	"github.com/goldiran-app/goldiran-workspace/apps/api/internal/db"
	"github.com/goldiran-app/goldiran-workspace/apps/api/internal/httpapi"
	"github.com/goldiran-app/goldiran-workspace/apps/api/internal/store"
	"github.com/goldiran-app/goldiran-workspace/apps/api/migrations"
)

func main() {
	cfg := config.FromEnv()
	ctx, cancel := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer cancel()

	pool, err := db.Connect(ctx, cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("database: %v", err)
	}
	defer pool.Close()

	if err := db.Migrate(ctx, pool, migrations.FS); err != nil {
		log.Fatalf("migrate: %v", err)
	}

	pg := store.NewPostgres(pool)
	server := &http.Server{
		Addr:         cfg.HTTPAddr,
		Handler:      httpapi.NewRouter(pg, cfg.CORSOrigin),
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 10 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	go func() {
		log.Printf("api listening on %s", cfg.HTTPAddr)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("http: %v", err)
		}
	}()

	<-ctx.Done()
	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer shutdownCancel()
	if err := server.Shutdown(shutdownCtx); err != nil {
		log.Printf("shutdown: %v", err)
	}
}
