import { describe, expect, it } from "vitest";
import { apiUrl } from "./api";

describe("apiUrl", () => {
  it("joins the API base with a path", () => {
    expect(apiUrl("/api/v1/projects")).toBe("http://localhost:8080/api/v1/projects");
  });

  it("adds a leading slash when missing", () => {
    expect(apiUrl("health")).toBe("http://localhost:8080/health");
  });
});
