import { api } from "../utils/api";

describe("api client", () => {
  test("has correct baseURL and JSON headers", () => {
    expect(api.defaults.baseURL).toBe("http://127.0.0.1:8000");
    expect(api.defaults.headers.common["Content-Type"]).toBe("application/json");
    expect(api.defaults.headers.common["Accept"]).toBe("application/json");
  });
});
