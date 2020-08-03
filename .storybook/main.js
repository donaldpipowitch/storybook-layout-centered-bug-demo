module.exports = {
  stories: [
    '../stories/**/*.stories.mdx',
    '../stories/**/*.stories.@(js|jsx|ts|tsx)',
  ],
  addons: [
    '@storybook/addon-essentials', // e.g. for mdx, source loader, docgen
    '@storybook/addon-a11y',
    '@storybook/addon-backgrounds',
    // '@storybook/addon-links',
    // '@storybook/addon-actions',
  ],
};
