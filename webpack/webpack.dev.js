const _ = require('lodash');
const webpack = require('webpack');
const merge = require('webpack-merge');
const dllDepsConfig = require('./dll-deps.config');
const commonWebpack = require('./webpack.common');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const lsMostRecentFile = require('../utils/lsMostRecentFile');

const hotMiddlewareScript = 'webpack-hot-middleware/client?timeout=30000';

// base config
const config = {
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

// IMPORTANT:
// - for this codepath:
//   - set env var in shell: `export WP__ENABLE_DLL=1`
//   - build assets in shell: `mk-webpack-dlls.sh`
if (hasEnabledDll()) {
  const dllEntryNames = Object.keys(dllDepsConfig.entry);
  modifyConfigForWebpackDll(config, dllEntryNames);
}

// ----------
module.exports = merge.smart(commonWebpack, config);

// ----------
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
  _.forEach(dllEntryNames, function (dllEntryName) {
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

function mkHtmlFragForDllBundles(dllEntryNames) {
  let result = _.map(dllEntryNames, function (dllEntryName) {
    const jsBaseName = getLatestDllChunkFileBaseName(dllEntryName);
    return mkHtmlFrag(jsBaseName);
  });
  return result.join('');
}

function hasEnabledDll() {
  const enableDll = _.get(process.env, 'WP__ENABLE_DLL');
  return /(1|true)/i.test(enableDll);
}

function getManifest(dllEntryName) {
  if (!dllEntryName) {
    return;
  }
  return require(__dirname + `/../dist/js/dll-${dllEntryName}.manifest.json`);
}

function getLatestDllChunkFileBaseName(dllEntryName) {
  const glob = __dirname + `/../dist/js/dll-${dllEntryName}*.chunk.js`;
  return lsMostRecentFile(glob);
}

function mkHtmlFrag(jsBaseName) {
  return (jsBaseName) && `<script src="/js/${jsBaseName}"></script>` || '';
}
