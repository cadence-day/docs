import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */
const sidebars: SidebarsConfig = {
  // FAQ sidebar - all FAQ pages
  faqSidebar: [
    {
      type: "category",
      label: "Frequently Asked Questions",
      items: [
        "faq/general",
        "faq/activities",
        "faq/notes",
        "faq/calendar",
        "faq/insights",
        "faq/sync-and-devices",
        "faq/location-health",
        "faq/encryption",
        "faq/troubleshooting",
      ],
    },
  ],

  // Features sidebar - feature guides
  featuresSidebar: [
    {
      type: "category",
      label: "Feature Guides",
      items: [
        "features/activity-tracking",
        "features/timeline-calendar",
        "features/note-taking",
        "features/trackers",
        "features/analytics",
        "features/extensions",
        "features/privacy-security",
      ],
    },
  ],
  // Developers sidebar - API docs (work in progress)
  developersSidebar: [
    {
      type: "category",
      label: "Developers",
      items: [
        "developers/getting-started",
        "developers/error-handling",
        // Add more API docs here as they are completed
      ],
    },
  ],
};

export default sidebars;
