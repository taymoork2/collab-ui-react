const _ = require('lodash');
const args = require('yargs').argv;
const path = require('path');

const appPath = path.resolve('./app');
const testPath = path.resolve('./test');
const examplePath = path.resolve('./examples');

exports.js = {
  test: /\.js$/,
  use: [
    {
      loader: 'cache-loader',
    },
    {
      loader: 'ng-annotate-loader',
    },
  ],
  exclude: [/node_modules/, /\.spec\.js$/],
};

exports.eslint = {
  test: /\.js$/,
  use: [
    {
      loader: 'eslint-loader',
      options: {
        failOnError: true,
      },
    },
  ],
  include: [appPath, testPath],
  exclude: [/node_modules/],
  enforce: 'pre',
};

exports.tslint = {
  test: /\.ts$/,
  use: [
    {
      loader: 'tslint-loader',
      options: {
        emitErrors: true,
        failOnHint: true,
      },
    },
  ],
  include: [appPath, testPath, examplePath],
  exclude: [/node_modules/],
  enforce: 'pre',
};

exports.ts = {
  test: /\.ts$/,
  use: [
    {
      loader: 'cache-loader',
    },
    {
      loader: 'ng-annotate-loader',
    },
    {
      loader: 'awesome-typescript-loader',
      options: {
        silent: true,
      },
    },
  ],
  include: [appPath, testPath, examplePath],
  exclude: [/node_modules/],
};

exports.scss = {
  test: /\.scss$/,
  use: [
    {
      loader: 'cache-loader',
    },
    {
      loader: 'style-loader',
    },
    {
      loader: 'css-loader',
      options: {
        sourceMap: true,
        importLoaders: 1,
      },
    },
    {
      // uses postcss.config.js for options (needed for ExtractTextPlugin)
      loader: 'postcss-loader',
      options: {
        sourceMap: true,
      },
    },
    {
      loader: 'sass-loader',
      options: {
        sourceMap: true,
        sourceComments: true,
        includePaths: [
          path.resolve('./app'),
          path.resolve('node_modules/bootstrap-sass/assets/stylesheets'),
          path.resolve('node_modules/foundation-sites/scss'),
        ],
      },
    },
  ],
};

exports.html = {
  test: /\.html$/,
  use: [
    {
      loader: 'html-loader',
      options: {
        minimize: true,
        removeAttributeQuotes: false, // consistency preference
      },
    },
  ],
  exclude: /\/app\/index.html$/,
};

exports.assets = {
  test: /\.(csv|pdf)(\?v=.*)?$/,
  use: [
    {
      loader: 'file-loader',
      options: {
        name: '[path][name].[ext]',
      },
    },
  ],
};

exports.fonts = {
  test: /\.(woff|woff2|ttf|eot)(\?v=.*)?$/,
  use: [
    {
      loader: 'file-loader',
      options: {
        name: 'fonts/[name].[ext]?[hash]',
      },
    },
  ],
};

exports.images = {
  test: /\.(svg|png|jpg|jpeg|gif|ico)(\?v=.*)?$/,
  use: [
    {
      loader: 'file-loader',
      options: {
        name: '[path][name].[ext]?[hash]',
      },
    },
  ],
  exclude: [/collab-amcharts/, /node_modules/],
};

exports.vendorImages = {
  test: /\.(svg|png|jpg|jpeg|gif|ico)(\?v=.*)?$/,
  use: [
    {
      loader: 'file-loader',
      options: {
        name: 'images/[name].[ext]?[hash]',
      },
    },
  ],
  include: /node_modules/,
  exclude: /collab-amcharts/,
};

exports.dependencies = [{
  test: /\/jquery.js$/,
  use: [
    {
      loader: 'expose-loader',
      options: '$',
    },
    {
      loader: 'expose-loader',
      options: 'jQuery',
    },
  ],
}, {
  test: /(FileSaver|fabric|xlsx\/xlsx|jszip\/jszip).js$/,
  use: [
    {
      loader: 'script-loader',
    },
  ],
}, {
  test: /(bootstrap-tokenfield).js$/,
  use: [
    {
      loader: 'imports-loader',
      options: 'define=>false',
    },
  ],
}, {
  test: /bard.js$/,
  use: [
    {
      loader: 'script-loader',
    },
  ],
}, {
  test: /\/sinon.js$/,
  use: [
    {
      loader: 'script-loader',
    },
  ],
}, {
  test: /jasmine-promise-matchers.js$/,
  use: [
    {
      loader: 'script-loader',
    },
  ],
}, {
  test: /bmmp\/cisco-bmmp.js$/,
  use: [
    {
      loader: 'script-loader',
    },
  ],
}];

exports.instrumentJs = {
  test: /\.js$/,
  use: [
    {
      loader: 'istanbul-instrumenter-loader',
      options: {
        esModules: false,
      },
    },
  ],
  exclude: [
    /node_modules/,
    /spec\.js$/,
  ],
};

exports.instrumentTs = {
  test: /\.ts$/,
  use: [
    {
      loader: 'istanbul-instrumenter-loader',
      options: {
        esModules: true,
      },
    },
  ],
  exclude: [
    /node_modules/,
    /spec\.ts$/,
  ],
  enforce: 'post',
};

function stripCacheLoader(loaderList) {
  return _.reject(loaderList, {
    loader: 'cache-loader',
  });
}

// remove 'cache-loader' for CLI switch
if (args.env && args.env.nocacheloader) {
  exports.js.use = stripCacheLoader(exports.js.use);
  exports.ts.use = stripCacheLoader(exports.ts.use);
  exports.scss.use = stripCacheLoader(exports.scss.use);
}
