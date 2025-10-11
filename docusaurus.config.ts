import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Cadence Documentation',
  tagline: 'Track your time, understand your rhythms, live intentionally',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  url: 'https://docs.cadence.day',
  baseUrl: '/',

  organizationName: 'cadence-day',
  projectName: 'docs',

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'de', 'da', 'es', 'fr'],
    localeConfigs: {
      en: {
        label: 'English',
        direction: 'ltr',
        htmlLang: 'en-US',
      },
      de: {
        label: 'Deutsch',
        direction: 'ltr',
        htmlLang: 'de-DE',
      },
      da: {
        label: 'Dansk',
        direction: 'ltr',
        htmlLang: 'da-DK',
      },
      es: {
        label: 'Español',
        direction: 'ltr',
        htmlLang: 'es-ES',
      },
      fr: {
        label: 'Français',
        direction: 'ltr',
        htmlLang: 'fr-FR',
      },
    },
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: 'docs',
          editUrl: 'https://github.com/cadence-day/docs/edit/main/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/cadence-social-card.png',
    metadata: [
      {name: 'keywords', content: 'cadence, time tracking, activity tracking, productivity, reflection, self-awareness'},
      {name: 'description', content: 'Learn how to use Cadence.day - track your time, understand your rhythms, and live more intentionally.'},
    ],
    
    colorMode: {
      defaultMode: 'dark',
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },
    
    algolia: {
      appId: 'YOUR_ALGOLIA_APP_ID',
      apiKey: 'YOUR_ALGOLIA_SEARCH_API_KEY',
      indexName: 'cadence-docs',
      contextualSearch: true,
      searchParameters: {},
      searchPagePath: 'search',
      insights: false,
    },
    
    navbar: {
      title: 'Cadence',
      logo: {
        alt: 'Cadence Logo',
        src: 'img/logo.png',
        srcDark: 'img/logo.png',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'faqSidebar',
          position: 'left',
          label: 'FAQ',
        },
        {
          type: 'docSidebar',
          sidebarId: 'featuresSidebar',
          position: 'left',
          label: 'Features',
        },
        {
          type: 'localeDropdown',
          position: 'right',
        },
        {
          href: 'https://apps.apple.com/app/cadence-day/id6745115112',
          label: 'Download App',
          position: 'right',
        },
        {
          href: 'https://github.com/cadence-day-dev',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Documentation',
          items: [
            {
              label: 'Getting Started',
              to: '/docs/intro',
            },
            {
              label: 'FAQ',
              to: '/docs/faq/general',
            },
            {
              label: 'Features',
              to: '/docs/features/activity-tracking',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'Instagram',
              href: 'https://instagram.com/cadencedotday',
            },
            {
              label: 'X (Twitter)',
              href: 'https://x.com/cadencedotday',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/cadence-day-dev',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'Download App',
              href: 'https://apps.apple.com/app/cadence-day/id6745115112',
            },
            {
              label: 'Support',
              href: 'mailto:admin@cadence.day',
            },
            {
              label: 'Privacy Policy',
              href: 'https://cadence.day/privacy',
            },
            {
              label: 'Terms of Service',
              href: 'https://cadence.day/terms',
            },
          ],
        },
      ],
      copyright: `© ${new Date().getFullYear()} Cadence.day. All rights reserved.<br/><span style="opacity: 0.7; font-size: 0.875rem;">Based in Berlin · Copenhagen · New York</span>`,
    },
    
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'json', 'typescript', 'javascript'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
