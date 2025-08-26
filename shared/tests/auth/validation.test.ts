import {
  isValidEmail,
  validateEmailField,
  validateName,
  validatePassword,
  validatePasswordField,
  validateRepeatPasswordField,
} from "@/shared/auth/utils/validation";

describe("auth validation utilities", () => {
  describe("isValidEmail", () => {
    it("accepts valid emails", () => {
      expect(isValidEmail("test@example.com")).toBe(true);
      expect(isValidEmail("a.b+tag@sub.domain.co")).toBe(true);
    });

    it("rejects invalid emails", () => {
      expect(isValidEmail("")).toBe(false);
      expect(isValidEmail("not-an-email")).toBe(false);
      expect(isValidEmail("no-domain@")).toBe(false);
    });

    describe("validateName", () => {
      it("requires a name", () => {
        expect(validateName("")).toBe("Name is required");
      });

      it("requires at least 2 characters", () => {
        expect(validateName("A")).toBe("Name must be at least 2 characters");
      });

      it("requires first and last name", () => {
        expect(validateName("SingleName")).toBe(
          "Please enter both first and last name"
        );
      });

      expect(validateName("First Last")).toBeNull();
      expect(validateName("Test User")).toBeNull();
      expect(validateName("First Last")).toBeNull();
    });
  });

  describe("email field validation", () => {
    it("validates presence and format", () => {
      expect(validateEmailField("")).toBe("Email is required");
      expect(validateEmailField("bad-email")).toBe(
        "Please enter a valid email address"
      );
      expect(validateEmailField("ok@example.com")).toBeNull();
    });
  });

  describe("password field validation", () => {
    it("validates required and rules", () => {
      expect(validatePasswordField("")).toBe("Password is required");
      expect(validatePasswordField("short1A!")).toBe(
        "Password must be at least 10 characters"
      );
      expect(validatePasswordField("NOLOWERCASE1!")).toBe(
        "Password must contain at least one lowercase letter"
      );
      expect(validatePasswordField("nouppercase1!")).toBe(
        "Password must contain at least one uppercase letter"
      );
      expect(validatePasswordField("NoNumber!!")).toBe(
        "Password must contain at least one digit"
      );
      expect(validatePasswordField("NoSpecial1A")).toBe(
        "Password must contain at least one special character"
      );

      // Valid password
      expect(validatePasswordField("GoodPass1!a")).toBeNull();
    });
  });

  describe("repeat password validation", () => {
    it("requires confirmation and matching", () => {
      expect(validateRepeatPasswordField("", "password")).toBe(
        "Please confirm your password"
      );
      expect(validateRepeatPasswordField("mismatch", "password")).toBe(
        "Passwords do not match"
      );
      expect(validateRepeatPasswordField("password", "password")).toBeNull();
    });
  });

  describe("validatePassword (combined)", () => {
    const strong = "GoodPass1!a"; // meets all rules

    it("detects non-matching passwords", () => {
      const res = validatePassword("aBcDef1!23", "different", true);
      expect(res.isValid).toBe(false);
      expect(res.error).toBe("Passwords do not match");
    });

    it("enforces length and character rules and terms", () => {
      expect(validatePassword("short1A!", "short1A!", true).isValid).toBe(
        false
      );
      expect(
        validatePassword("NOLOWERCASE1!", "NOLOWERCASE1!", true).isValid
      ).toBe(false);
      expect(validatePassword(strong, strong, false).isValid).toBe(false);
      expect(validatePassword(strong, strong, false).error).toBe(
        "You must agree to the terms and conditions"
      );

      const ok = validatePassword(strong, strong, true);
      expect(ok.isValid).toBe(true);
      expect(ok.error).toBeNull();
    });
  });
});
