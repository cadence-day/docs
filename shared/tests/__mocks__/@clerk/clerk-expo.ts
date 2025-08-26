// Mock Clerk authentication
const mockUser = {
  id: "test-user-id",
  emailAddresses: [{ emailAddress: "test@example.com" }],
  firstName: "Test",
  lastName: "User",
};

const mockSession = {
  id: "test-session-id",
  userId: "test-user-id",
  getToken: jest.fn().mockResolvedValue("mock-jwt-token"),
};

const mockClerk = {
  user: mockUser,
  session: mockSession,
  signOut: jest.fn().mockResolvedValue(undefined),
  signIn: {
    create: jest.fn().mockResolvedValue({ status: "complete" }),
  },
  signUp: {
    create: jest.fn().mockResolvedValue({ status: "complete" }),
  },
  loaded: true,
  isSignedIn: true,
};

export const useAuth = jest.fn(() => ({
  isLoaded: true,
  isSignedIn: true,
  userId: "test-user-id",
  sessionId: "test-session-id",
  getToken: jest.fn().mockResolvedValue("mock-jwt-token"),
  signOut: jest.fn().mockResolvedValue(undefined),
}));

export const useUser = jest.fn(() => ({
  isLoaded: true,
  isSignedIn: true,
  user: mockUser,
}));

export const useSession = jest.fn(() => ({
  isLoaded: true,
  session: mockSession,
}));

export const getClerkInstance = jest.fn(() => mockClerk);

export const ClerkProvider = ({ children }: { children: React.ReactNode }) =>
  children;

export const SignedIn = ({ children }: { children: React.ReactNode }) =>
  children;

export const SignedOut = ({ children }: { children: React.ReactNode }) => null;
