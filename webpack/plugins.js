const webpack = require('webpack');

const isVendor = module => module.context && module.context.includes('node_modules');

const commonsChunkPlugins = [
  // separate app vendor files
  new webpack.optimize.CommonsChunkPlugin({
    chunks: ['bootstrap'],
    name: 'bootstrap-vendor',
    minChunks: isVendor,
  }),
  // separate async vendor files
  new webpack.optimize.CommonsChunkPlugin({
    chunks: ['modules'],
    async: 'modules-vendor',
    minChunks: isVendor,
  }),
  // separate runtime functions
  new webpack.optimize.CommonsChunkPlugin({
    name: 'manifest',
    minChunks: Infinity,
  }),
];

exports.commonsChunkPlugins = commonsChunkPlugins;
