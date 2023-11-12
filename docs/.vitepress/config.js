export default {
  title: 'wc-context',
  description: 'Context for web components',
  base: 'wc-context',
  themeConfig: {
    sidebar: [
      {
        text: 'Introduction',
        items: [
          { text: 'About wc-context', link: '/' },
          { text: 'Getting Started', link: '/getting-started' },
        ],
      },
      {
        text: 'Usage',
        items: [
          { text: 'Context identification', link: '/context-id' },
          { text: 'Lit integration', link: '/lit-integration' },
          { text: 'Reactive controllers', link: '/controllers' },
          { text: 'Generic mixin', link: '/generic-mixin' },
          { text: 'Dedicated elements', link: '/dedicated-elements' },
          { text: 'Core API', link: '/core' },
        ],
      },
      {
        text: 'Guides',
        items: [
          { text: 'Testing', link: '/testing' },
          { text: 'Storybook', link: '/storybook' },
        ],
      },
    ],
  },
}
