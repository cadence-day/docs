import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

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
                "faq/encryption",
                "faq/calendar",
                "faq/notifications",
                "faq/subscription",
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
                "features/note-taking",
                "features/reflections",
                "features/privacy-security",
            ],
        },
    ],
};

export default sidebars;
