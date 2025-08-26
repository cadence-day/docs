import {
  parseClerkErrors,
  getClerkErrorMessage,
  CLERK_ERROR_MESSAGES,
} from "@/shared/auth/utils/errorHandler";

describe("Clerk error handler utilities", () => {
  it("parses null/undefined error into fallback", () => {
    const parsed = parseClerkErrors(null);
    expect(parsed.hasErrors).toBe(true);
    expect(parsed.toastMessage).toBeDefined();
    expect(parsed.fieldErrors.general).toBeDefined();
  });

  it("parses structured clerk errors and maps fields", () => {
    const clerkError = {
      errors: [
        {
          message: "Email is invalid",
          meta: { paramName: "email_address" },
        },
        {
          message: "Password too weak",
          meta: { paramName: "password" },
        },
        {
          message: "Some general issue",
        },
      ],
    };

    const parsed = parseClerkErrors(clerkError);
    expect(parsed.hasErrors).toBe(true);
    expect(parsed.fieldErrors.email).toBe("Email is invalid");
    expect(parsed.fieldErrors.password).toBe("Password too weak");
    expect(parsed.fieldErrors.general).toBe("Some general issue");
    expect(parsed.toastMessage).toBe("Email is invalid");
  });

  it("falls back to message when errors array missing", () => {
    const e = { message: "Network failed" };
    const parsed = parseClerkErrors(e);
    expect(parsed.hasErrors).toBe(true);
    expect(parsed.generalError).toBe("Network failed");
    expect(parsed.toastMessage).toBe("Network failed");
  });

  it("returns friendly messages from codes via getClerkErrorMessage", () => {
    const code = Object.keys(CLERK_ERROR_MESSAGES)[0];
    const fallback = "fallback msg";
    const msg = getClerkErrorMessage(code, fallback);
    expect(msg).not.toBe(fallback);
    // unknown code returns fallback
    expect(getClerkErrorMessage("unknown_code", fallback)).toBe(fallback);
  });
});
