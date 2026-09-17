package httpapi

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/goldiran-app/goldiran-workspace/apps/api/internal/store"
)

func TestHealth(t *testing.T) {
	handler := NewRouter(store.NewMemory(), "http://localhost:3000")
	req := httptest.NewRequest(http.MethodGet, "/health", nil)
	rec := httptest.NewRecorder()
	handler.ServeHTTP(rec, req)
	if rec.Code != http.StatusOK {
		t.Fatalf("status = %d, want 200", rec.Code)
	}
}

func TestInitiativeCRUD(t *testing.T) {
	handler := NewRouter(store.NewMemory(), "http://localhost:3000")

	createBody, _ := json.Marshal(map[string]string{
		"name":        "Delivery",
		"description": "Core delivery work",
	})
	createReq := httptest.NewRequest(http.MethodPost, "/api/v1/initiatives", bytes.NewReader(createBody))
	createRec := httptest.NewRecorder()
	handler.ServeHTTP(createRec, createReq)
	if createRec.Code != http.StatusCreated {
		t.Fatalf("create status = %d body=%s", createRec.Code, createRec.Body.String())
	}

	var created struct {
		Data struct {
			ID   string `json:"id"`
			Name string `json:"name"`
		} `json:"data"`
	}
	if err := json.Unmarshal(createRec.Body.Bytes(), &created); err != nil {
		t.Fatal(err)
	}
	if created.Data.Name != "Delivery" {
		t.Fatalf("name = %q", created.Data.Name)
	}

	listReq := httptest.NewRequest(http.MethodGet, "/api/v1/initiatives", nil)
	listRec := httptest.NewRecorder()
	handler.ServeHTTP(listRec, listReq)
	if listRec.Code != http.StatusOK {
		t.Fatalf("list status = %d", listRec.Code)
	}

	getReq := httptest.NewRequest(http.MethodGet, "/api/v1/initiatives/"+created.Data.ID, nil)
	getRec := httptest.NewRecorder()
	handler.ServeHTTP(getRec, getReq)
	if getRec.Code != http.StatusOK {
		t.Fatalf("get status = %d", getRec.Code)
	}

	updateBody, _ := json.Marshal(map[string]string{"name": "Updated", "description": ""})
	updateReq := httptest.NewRequest(http.MethodPut, "/api/v1/initiatives/"+created.Data.ID, bytes.NewReader(updateBody))
	updateRec := httptest.NewRecorder()
	handler.ServeHTTP(updateRec, updateReq)
	if updateRec.Code != http.StatusOK {
		t.Fatalf("update status = %d", updateRec.Code)
	}

	deleteReq := httptest.NewRequest(http.MethodDelete, "/api/v1/initiatives/"+created.Data.ID, nil)
	deleteRec := httptest.NewRecorder()
	handler.ServeHTTP(deleteRec, deleteReq)
	if deleteRec.Code != http.StatusNoContent {
		t.Fatalf("delete status = %d", deleteRec.Code)
	}
}

func TestProjectAndIssueRelationships(t *testing.T) {
	handler := NewRouter(store.NewMemory(), "http://localhost:3000")

	initiativeBody, _ := json.Marshal(map[string]string{"name": "Platform", "description": ""})
	initiativeReq := httptest.NewRequest(http.MethodPost, "/api/v1/initiatives", bytes.NewReader(initiativeBody))
	initiativeRec := httptest.NewRecorder()
	handler.ServeHTTP(initiativeRec, initiativeReq)

	var initiative struct {
		Data struct {
			ID string `json:"id"`
		} `json:"data"`
	}
	_ = json.Unmarshal(initiativeRec.Body.Bytes(), &initiative)

	projectBody, _ := json.Marshal(map[string]any{
		"name":         "API",
		"description":  "",
		"initiativeId": initiative.Data.ID,
	})
	projectReq := httptest.NewRequest(http.MethodPost, "/api/v1/projects", bytes.NewReader(projectBody))
	projectRec := httptest.NewRecorder()
	handler.ServeHTTP(projectRec, projectReq)
	if projectRec.Code != http.StatusCreated {
		t.Fatalf("create project status = %d body=%s", projectRec.Code, projectRec.Body.String())
	}

	var project struct {
		Data struct {
			ID string `json:"id"`
		} `json:"data"`
	}
	_ = json.Unmarshal(projectRec.Body.Bytes(), &project)

	issueBody, _ := json.Marshal(map[string]string{
		"projectId":   project.Data.ID,
		"title":       "Add health check",
		"description": "",
		"status":      "open",
	})
	issueReq := httptest.NewRequest(http.MethodPost, "/api/v1/issues", bytes.NewReader(issueBody))
	issueRec := httptest.NewRecorder()
	handler.ServeHTTP(issueRec, issueReq)
	if issueRec.Code != http.StatusCreated {
		t.Fatalf("create issue status = %d body=%s", issueRec.Code, issueRec.Body.String())
	}

	nestedReq := httptest.NewRequest(http.MethodGet, "/api/v1/projects/"+project.Data.ID+"/issues", nil)
	nestedRec := httptest.NewRecorder()
	handler.ServeHTTP(nestedRec, nestedReq)
	if nestedRec.Code != http.StatusOK {
		t.Fatalf("nested issues status = %d", nestedRec.Code)
	}

	statsReq := httptest.NewRequest(http.MethodGet, "/api/v1/stats", nil)
	statsRec := httptest.NewRecorder()
	handler.ServeHTTP(statsRec, statsReq)
	if statsRec.Code != http.StatusOK {
		t.Fatalf("stats status = %d", statsRec.Code)
	}
}

func TestCreateInitiativeRejectsEmptyName(t *testing.T) {
	handler := NewRouter(store.NewMemory(), "http://localhost:3000")
	body, _ := json.Marshal(map[string]string{"name": "", "description": ""})
	req := httptest.NewRequest(http.MethodPost, "/api/v1/initiatives", bytes.NewReader(body))
	rec := httptest.NewRecorder()
	handler.ServeHTTP(rec, req)
	if rec.Code != http.StatusBadRequest {
		t.Fatalf("status = %d, want 400", rec.Code)
	}
}
