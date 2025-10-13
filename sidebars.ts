import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

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
      type: 'category',
      label: 'Frequently Asked Questions',
      items: [
        'faq/general',
        'faq/activities',
        'faq/notes',
        'faq/encryption',
        'faq/calendar',
        'faq/notifications',
        'faq/subscription',
        'faq/troubleshooting',
      ],
    },
  ],

  // Features sidebar - feature guides
  featuresSidebar: [
    {
      type: 'category',
      label: 'Feature Guides',
      items: [
        'features/activity-tracking',
        'features/note-taking',
        'features/reflections',
        'features/privacy-security',
      ],
    },
  ],
    // Developers sidebar - API docs (work in progress)
    developersSidebar: [
      {
        type: 'category',
        label: 'Developers',
        items: [
          'developers/getting-started',
          // Add more API docs here as they are completed
        ],
      },
    ],
};

export default sidebars;
