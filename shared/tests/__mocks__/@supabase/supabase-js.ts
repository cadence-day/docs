// Mock Supabase client
export interface MockSupabaseResponse<T = any> {
  data: T | null;
  error: any;
}

export interface MockSupabaseQuery {
  select: jest.Mock;
  insert: jest.Mock;
  update: jest.Mock;
  delete: jest.Mock;
  upsert: jest.Mock;
  eq: jest.Mock;
  neq: jest.Mock;
  in: jest.Mock;
  contains: jest.Mock;
  like: jest.Mock;
  ilike: jest.Mock;
  is: jest.Mock;
  gte: jest.Mock;
  lte: jest.Mock;
  gt: jest.Mock;
  lt: jest.Mock;
  order: jest.Mock;
  limit: jest.Mock;
  range: jest.Mock;
  single: jest.Mock;
  maybeSingle: jest.Mock;
  then: jest.Mock;
}

const createMockQuery = (): MockSupabaseQuery => {
  const mockQuery: any = {
    select: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    upsert: jest.fn(),
    eq: jest.fn(),
    neq: jest.fn(),
    in: jest.fn(),
    contains: jest.fn(),
    like: jest.fn(),
    ilike: jest.fn(),
    is: jest.fn(),
    gte: jest.fn(),
    lte: jest.fn(),
    gt: jest.fn(),
    lt: jest.fn(),
    order: jest.fn(),
    limit: jest.fn(),
    range: jest.fn(),
    single: jest.fn(),
    maybeSingle: jest.fn(),
    then: jest.fn(),
  };

  // Make all methods chainable except then
  Object.keys(mockQuery).forEach((key) => {
    if (key !== "then") {
      mockQuery[key].mockReturnValue(mockQuery);
    }
  });

  // Mock the then method to behave like a promise
  mockQuery.then.mockImplementation((resolve: (value: any) => any) => {
    return Promise.resolve({
      data: [
        { id: "1", name: "Test Activity", user_id: "test-user" },
        { id: "2", name: "Another Activity", user_id: "test-user" },
      ],
      error: null,
    }).then(resolve);
  });

  return mockQuery;
};

export const mockSupabaseClient = {
  from: jest.fn(() => createMockQuery()),
  auth: {
    getSession: jest.fn().mockResolvedValue({
      data: { session: { access_token: "mock-token" } },
      error: null,
    }),
    getUser: jest.fn().mockResolvedValue({
      data: { user: { id: "test-user-id" } },
      error: null,
    }),
    signInWithPassword: jest.fn().mockResolvedValue({
      data: { user: { id: "test-user-id" }, session: {} },
      error: null,
    }),
    signUp: jest.fn().mockResolvedValue({
      data: { user: { id: "test-user-id" }, session: {} },
      error: null,
    }),
    signOut: jest.fn().mockResolvedValue({ error: null }),
  },
  storage: {
    from: jest.fn(() => ({
      upload: jest.fn().mockResolvedValue({
        data: { path: "test-path" },
        error: null,
      }),
      download: jest.fn().mockResolvedValue({
        data: new Blob(),
        error: null,
      }),
      remove: jest.fn().mockResolvedValue({ error: null }),
      getPublicUrl: jest.fn().mockReturnValue({
        data: { publicUrl: "https://test.com/file" },
      }),
    })),
  },
  rpc: jest.fn().mockResolvedValue({ data: null, error: null }),
};

export const createClient = jest.fn(() => mockSupabaseClient);
