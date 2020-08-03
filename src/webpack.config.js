const { join } = require('path');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const SentryCliPlugin = require('@sentry/webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { DefinePlugin } = require('webpack');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const { dev } = require('webpack-nano/argv');
const { WebpackPluginServe } = require('webpack-plugin-serve');

const mode = dev ? 'development' : 'production';
const watch = dev;
if (!dev) process.env.NODE_ENV = 'production';

const babelConfig = require('./babel.config');
if (dev) babelConfig.plugins.push(require.resolve('react-refresh/babel'));

const rules = [
  {
    test: /\.tsx?$/,
    exclude: /node_modules/,
    loader: 'babel-loader',
    options: babelConfig,
  },
  {
    test: /\.css$/,
    loader: 'file-loader',
  },
  {
    test: /\.(png|jpg|gif|svg|ico)$/,
    loader: 'url-loader?limit=1000&name=[name]-[hash].[ext]',
  },
  {
    test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
    loader: 'file-loader',
  },
  {
    test: /\.(woff|woff2)$/,
    loader: 'url-loader?prefix=font/&limit=5000',
  },
  {
    test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
    loader: 'url-loader?limit=10000&mimetype=application/octet-stream',
  },
];

const entry = ['./src/index.tsx'];
if (dev) entry.push('webpack-plugin-serve/client');

const output = {
  path: join(process.cwd(), 'dist'),
  filename: '[name].[chunkhash].js',
  chunkFilename: '[name].[chunkhash].lazy.js',
};
if (dev) {
  output.filename = '[name].js';
  output.chunkFilename = '[name].lazy.js';
}

const plugins = [
  new HtmlWebpackPlugin({ template: 'src/index.html' }),
  new CleanWebpackPlugin({
    // doesn't play nice with webpack-plugin-serve
    cleanStaleWebpackAssets: false,
  }),
];
if (dev) {
  plugins.push(
    new ReactRefreshWebpackPlugin({
      // it looks like the error overlay does not only appear on build errors,
      // but also general errors which makes debugging error boundaries hard
      // (that' why we deactivated it)
      overlay: false,
    }),
    new WebpackPluginServe({
      host: 'localhost',
      port: 4200,
      static: output.path,
      progress: false,
      historyFallback: true,
      middleware: (app, builtins) =>
        app.use(async (ctx, next) => {
          // these file are processed by the file loader and hashed (even for development)
          // serve them with active caching to avoid flashing content
          // (e.g. fonts would be requested multiple times withing development,
          // because we use hot reloading)
          const exts = [
            '.png',
            '.jpg',
            '.gif',
            '.svg',
            '.ico',
            '.css',
            '.eot',
            '.woff',
            '.woff2',
            '.ttf',
          ];
          const [url] = ctx.url.split('?');
          if (exts.some((ext) => url.endsWith(ext))) {
            ctx.set('Cache-Control', 'public, max-age=60'); // in seconds
          }
          await next();
        }),
    })
  );
} else {
  const { CI_COMMIT_SHA = 'local-build' } = process.env;
  plugins.push(
    new DefinePlugin({
      'process.env.CI_COMMIT_SHA': JSON.stringify(CI_COMMIT_SHA),
    }),
    new SentryCliPlugin({
      release: CI_COMMIT_SHA,
      include: ['dist', 'src'],
      setCommits: {
        repo:
          'PRISMA European Capacity Platform GmbH / Platform / platform-front',
        commit: CI_COMMIT_SHA,
      },
      dryRun: CI_COMMIT_SHA === 'local-build',
      silent: CI_COMMIT_SHA === 'local-build',
    }),
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      // relative to output.path
      reportFilename: '../webpack-bundle-analyzer.html',
      openAnalyzer: false,
    })
  );
}

const resolve = {
  extensions: ['.ts', '.tsx', '.js'],
  alias: {
    // for smaller bundles
    lodash: 'lodash-es',
  },
};

const resolveLoader = {
  alias: {
    // see https://www.npmjs.com/package/copy-loader
    'copy-loader': 'file-loader?name=[path][name].[ext]&context=./src',
  },
};

const stats = {
  // copied from `'minimal'`
  all: false,
  modules: true,
  maxModules: 0,
  errors: true,
  warnings: true,
  // our additional options
  builtAt: true,
};

const devtool = dev ? 'cheap-module-eval-source-map' : 'source-map';

module.exports = {
  mode,
  watch,
  entry,
  output,
  module: { rules },
  plugins,
  resolve,
  stats,
  resolveLoader,
  devtool,
};
