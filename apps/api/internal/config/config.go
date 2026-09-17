package config

import "os"

type Config struct {
	DatabaseURL string
	HTTPAddr    string
	CORSOrigin  string
}

func FromEnv() Config {
	return Config{
		DatabaseURL: envOr("DATABASE_URL", "postgres://goldiran:goldiran@localhost:5432/goldiran?sslmode=disable"),
		HTTPAddr:    envOr("HTTP_ADDR", ":8080"),
		CORSOrigin:  envOr("CORS_ORIGIN", "http://localhost:3000"),
	}
}

func envOr(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}
