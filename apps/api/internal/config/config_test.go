package config

import "testing"

func TestEnvOrFallback(t *testing.T) {
	t.Setenv("DATABASE_URL", "")
	cfg := FromEnv()
	if cfg.HTTPAddr != ":8080" {
		t.Fatalf("HTTPAddr = %q, want :8080", cfg.HTTPAddr)
	}
	if cfg.CORSOrigin != "http://localhost:3000" {
		t.Fatalf("CORSOrigin = %q", cfg.CORSOrigin)
	}
}

func TestEnvOverrides(t *testing.T) {
	t.Setenv("HTTP_ADDR", ":9090")
	t.Setenv("CORS_ORIGIN", "http://example.test")
	t.Setenv("DATABASE_URL", "postgres://example")
	cfg := FromEnv()
	if cfg.HTTPAddr != ":9090" {
		t.Fatalf("HTTPAddr = %q, want :9090", cfg.HTTPAddr)
	}
	if cfg.CORSOrigin != "http://example.test" {
		t.Fatalf("CORSOrigin = %q", cfg.CORSOrigin)
	}
	if cfg.DatabaseURL != "postgres://example" {
		t.Fatalf("DatabaseURL = %q", cfg.DatabaseURL)
	}
}
