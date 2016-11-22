const _ = require('lodash');
const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const dllDepsConfig = require('./dll-deps.config');
const commonWebpack = require('./webpack.common');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const lsMostRecentFile = require('../utils/lsMostRecentFile');
const processEnvUtil = require('../utils/processEnvUtil')();

const hotMiddlewareScript = 'webpack-hot-middleware/client?timeout=30000';

// base config
const devWebpack = {
  entry: {
    styles: [hotMiddlewareScript],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'index.html',
      inject: 'body',
      ngStrictDi: 'ng-strict-di',
    }),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin(),
  ],
};

// ----------
function mkHtmlFrag(jsBaseName) {
  return (jsBaseName) ? `<script src="/js/${jsBaseName}"></script>` : '';
}

/* eslint-disable global-require, import/no-dynamic-require */
function getManifest(dllEntryName) {
  return require(path.resolve(__dirname, `../dist/js/dll-${dllEntryName}.manifest.json`));
}

function getLatestDllChunkFileBaseName(dllEntryName) {
  const glob = path.resolve(__dirname, `../dist/js/dll-${dllEntryName}*.chunk.js`);
  return lsMostRecentFile(glob);
}

function mkHtmlFragForDllBundles(dllEntryNames) {
  const result = _.map(dllEntryNames, (dllEntryName) => {
    const jsBaseName = getLatestDllChunkFileBaseName(dllEntryName);
    return mkHtmlFrag(jsBaseName);
  });
  return result.join('');
}

/* eslint-disable no-param-reassign */
function modifyConfigForWebpackDll(config, dllEntryNames) {
  // replace html plugin with one that includes the html fragment for the dll bundles
  const htmlFrag = mkHtmlFragForDllBundles(dllEntryNames);
  config.plugins[0] = new HtmlWebpackPlugin({
    template: 'index.html',
    inject: 'body',
    ngStrictDi: 'ng-strict-di',
    dllBundlesFrag: htmlFrag,
  });

  // add DllReferencePlugin(s) as-appropriate
  _.forEach(dllEntryNames, (dllEntryName) => {
    config.plugins.unshift(
      // notes:
      // - context: './app'
      // - manifest: parsed object for appropriate './dist/js/dll-*.manifest.json'
      new webpack.DllReferencePlugin({
        context: commonWebpack.context,
        manifest: getManifest(dllEntryName),
      })
    );
  });
}

// ----------
// IMPORTANT:
// - for this codepath:
//   - set env var in shell: `export WP__ENABLE_DLL=1`
//   - build assets in shell: `mk-webpack-dlls.sh`
if (processEnvUtil.hasEnabledDll()) {
  const dllEntryNames = Object.keys(dllDepsConfig.entry);
  modifyConfigForWebpackDll(devWebpack, dllEntryNames);
}

// ----------
module.exports = merge.smart(commonWebpack, devWebpack);
