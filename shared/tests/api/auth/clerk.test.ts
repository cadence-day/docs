import {
  getClerkInstance,
  useAuth,
  useSession,
  useUser,
} from "@clerk/clerk-expo";

describe("Clerk Authentication", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("useAuth hook", () => {
    it("should return authentication state", () => {
      const authState = useAuth();

      expect(authState.isLoaded).toBe(true);
      expect(authState.isSignedIn).toBe(true);
      expect(authState.userId).toBe("test-user-id");
      expect(authState.sessionId).toBe("test-session-id");
      expect(typeof authState.getToken).toBe("function");
      expect(typeof authState.signOut).toBe("function");
    });

    it("should provide getToken function", async () => {
      const authState = useAuth();
      const token = await authState.getToken();

      expect(token).toBe("mock-jwt-token");
    });

    it("should provide signOut function", async () => {
      const authState = useAuth();
      await authState.signOut();

      expect(authState.signOut).toHaveBeenCalled();
    });
  });

  describe("useUser hook", () => {
    it("should return user state", () => {
      const userState = useUser();

      expect(userState.isLoaded).toBe(true);
      expect(userState.isSignedIn).toBe(true);
      expect(userState.user).toBeDefined();
      expect(userState.user?.id).toBe("test-user-id");
      expect(userState.user?.firstName).toBe("Test");
      expect(userState.user?.lastName).toBe("User");
      expect(userState.user?.emailAddresses).toHaveLength(1);
      expect(userState.user?.emailAddresses[0].emailAddress).toBe(
        "test@example.com"
      );
    });
  });

  describe("useSession hook", () => {
    it("should return session state", () => {
      const sessionState = useSession();

      expect(sessionState.isLoaded).toBe(true);
      expect(sessionState.session).toBeDefined();
      expect(sessionState.session?.id).toBe("test-session-id");
      expect(typeof sessionState.session?.getToken).toBe("function");
    });

    it("should provide session getToken function", async () => {
      const sessionState = useSession();
      const token = await sessionState.session?.getToken();

      expect(token).toBe("mock-jwt-token");
    });
  });

  describe("getClerkInstance", () => {
    it("should return Clerk instance", () => {
      const clerkInstance = getClerkInstance();

      expect(clerkInstance).toBeDefined();
      expect(clerkInstance.user).toBeDefined();
      expect(clerkInstance.session).toBeDefined();
      expect(clerkInstance.loaded).toBe(true);
      expect(clerkInstance.isSignedIn).toBe(true);
    });

    it("should have sign out method", () => {
      const clerkInstance = getClerkInstance();
      expect(typeof clerkInstance.signOut).toBe("function");
    });

    it("should handle sign out", async () => {
      const clerkInstance = getClerkInstance();
      await clerkInstance.signOut();

      expect(clerkInstance.signOut).toHaveBeenCalled();
    });
  });

  describe("Authentication flow", () => {
    it("should provide consistent user ID across hooks", () => {
      const authState = useAuth();
      const userState = useUser();

      expect(authState.userId).toBe("test-user-id");
      expect(userState.user?.id).toBe("test-user-id");
    });

    it("should provide session tokens", async () => {
      const authToken = await useAuth().getToken();
      const sessionToken = await useSession().session?.getToken();
      const clerkToken = await getClerkInstance().session?.getToken();

      expect(authToken).toBe("mock-jwt-token");
      expect(sessionToken).toBe("mock-jwt-token");
      expect(clerkToken).toBe("mock-jwt-token");
    });
  });

  describe("Mock validation", () => {
    it("should have proper mock functions", () => {
      const authState = useAuth();
      const userState = useUser();
      const sessionState = useSession();
      const clerkInstance = getClerkInstance();

      // Validate that mocks are properly set up
      expect(jest.isMockFunction(authState.getToken)).toBe(true);
      expect(jest.isMockFunction(authState.signOut)).toBe(true);
      expect(jest.isMockFunction(sessionState.session?.getToken)).toBe(true);
      expect(jest.isMockFunction(clerkInstance.signOut)).toBe(true);
    });

    it("should provide expected mock data structure", () => {
      const userState = useUser();

      expect(userState.user).toMatchObject({
        id: "test-user-id",
        firstName: "Test",
        lastName: "User",
        emailAddresses: [{ emailAddress: "test@example.com" }],
      });
    });
  });
});
