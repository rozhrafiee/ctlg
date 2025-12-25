import { rest } from "msw";
import { server } from "../setupTests";
import { useAuthStore } from "../store/authStore";
import { api } from "../utils/api";

beforeEach(() => {
  // reset store state between tests
  useAuthStore.setState({ accessToken: null, refreshToken: null, user: null });
});

describe("auth store", () => {
  test("login sets tokens and fetches user", async () => {
    server.use(
      rest.post("http://127.0.0.1:8000/api/accounts/token/", (req, res, ctx) => {
        return res(ctx.json({ access: "access-token", refresh: "refresh-token" }));
      }),
      rest.get("http://127.0.0.1:8000/api/accounts/me/", (req, res, ctx) => {
        return res(ctx.json({ id: 1, username: "testuser", email: "t@test.com", role: "student", cognitive_level: 1 }));
      })
    );

    await useAuthStore.getState().login("user", "pass");

    expect(useAuthStore.getState().accessToken).toBe("access-token");
    expect(useAuthStore.getState().refreshToken).toBe("refresh-token");
    expect(api.defaults.headers.common.Authorization).toBe("Bearer access-token");
    expect(useAuthStore.getState().user?.username).toBe("testuser");
  });
});
