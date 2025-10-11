module.exports = {
  ci: {
    collect: {
      url: ["http://localhost:3000"],
      startServerCommand: "npm start",
      startServerReadyPattern: "Local:.*http://localhost:3000",
      startServerReadyTimeout: 30000
    },
    assert: {
      assertions: {
        "categories:performance": ["warn", {"minScore": 0.8}],
        "categories:accessibility": ["error", {"minScore": 0.9}],
        "categories:best-practices": ["warn", {"minScore": 0.8}],
        "categories:seo": ["error", {"minScore": 0.8}]
      }
    },
    upload: {
      target: "temporary-public-storage"
    }
  }
};