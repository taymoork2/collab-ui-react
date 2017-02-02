const path = require('path');
const webpack = require('webpack');
const commonWebpack = require('./webpack.common.js')(process.env);

// notes:
// - appContextRootDir: './app'
// - targetJsDir: './dist/js'
const appContextRootDir = commonWebpack.context;
const targetJsDir = path.resolve(appContextRootDir, '..', 'dist', 'js');

module.exports = {
  // resolved dependency paths are defined relative to this
  context: appContextRootDir,

  // multiple bundles can be defined (see: https://robertknight.github.io/posts/webpack-dll-plugins/)
  entry: {
    // notes:
    // - as naming convention, start with the target file basename, then:
    //   - replace all '-' and '.' to '_'
    //   - e.g. 'foo-Bar.js' => 'foo_Bar_js'
    bootstrap_dependencies_js: [path.resolve(appContextRootDir, 'bootstrap.dependencies.js')],
  },

  output: {
    // notes:
    // - filename: basename of dll dependency bundle emitted
    // - path: location where bundles are written to
    // - library: JS var name of object used at run-time
    filename: 'dll-[name]-[chunkhash].chunk.js',
    path: targetJsDir,
    library: 'dll_[name]',
  },

  plugins: [
    // notes:
    // - name: must match 'output.library' value
    // - path:
    //   - defines absolute path for where the manifest file is written to
    //   - its path is used when creating DllReferencePlugin (see 'manifest' property)
    new webpack.DllPlugin({
      name: 'dll_[name]',
      path: path.resolve(targetJsDir, 'dll-[name].manifest.json'),
    }),
  ],

  module: {
    // leverage all existing loader rules
    loaders: commonWebpack.module.loaders,
  },
};
