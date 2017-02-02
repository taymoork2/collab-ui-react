const path = require('path');

const appPath = path.resolve('./app');
const testPath = path.resolve('./test');

exports.js = {
  test: /\.js$/,
  use: [
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
  include: [appPath, testPath],
  exclude: [/node_modules/],
  enforce: 'pre',
};

exports.ts = {
  test: /\.ts$/,
  use: [
    {
      loader: 'ng-annotate-loader',
    },
    {
      loader: 'ts-loader',
    },
  ],
  exclude: [/node_modules/],
};

exports.scss = {
  test: /\.scss$/,
  use: [
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
      loader: 'ngtemplate-loader',
      options: {
        module: 'atlas.templates',
        relativeTo: `${appPath}/`,
      },
    },
    {
      loader: 'raw-loader',
    },
  ],
  exclude: /\/app\/index.html$/,
};

exports.assets = {
  test: /\.(json|csv|pdf)(\?v=.*)?$/,
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
        name: 'fonts/[name].[ext]',
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
        name: '[path][name].[ext]',
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
        name: 'images/[name].[ext]',
      },
    },
  ],
  include: /node_modules/,
  exclude: /collab-amcharts/,
};

exports.dependencies = [{
  test: require.resolve('jquery'),
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
  test: /stickyfill.js$/,
  use: [
    {
      loader: 'script-loader',
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

exports.instrument = {
  test: /\.(js|ts)$/,
  use: [
    {
      loader: 'istanbul-instrumenter-loader',
    },
  ],
  exclude: [
    /node_modules/,
    /spec\.(js|ts)$/,
  ],
  enforce: 'post',
};
