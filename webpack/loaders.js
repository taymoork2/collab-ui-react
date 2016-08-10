const path = require('path');

exports.js = {
  test: /\.js$/,
  loaders: ['ng-annotate'],
  exclude: [/node_modules/, /\.spec\.js$/],
};

exports.lint = {
  test: /\.js$/,
  loaders: ['eslint'],
  exclude: [/node_modules/, /\.spec\.js$/],
};

exports.ts = {
  test: /\.ts$/,
  loader: 'ts',
  exclude: [/node_modules/],
};

exports.scss = {
  test: /\.scss$/,
  loader: 'style!css?sourceMap!postcss!sass?sourceMap',
};

exports.html = {
  test: /\.html$/,
  exclude: /\/app\/index.html$/,
  loader: `ngtemplate?module=atlas.templates&relativeTo=${path.resolve('./app')}/!raw`,
};

exports.assets = {
  test: /\.(json|csv|pdf)(\?v=.*)?$/,
  loader: 'file?name=[path][name].[ext]',
};

exports.fonts = {
  test: /\.(woff|woff2|ttf|eot)(\?v=.*)?$/,
  loader: 'file?name=fonts/[name].[ext]',
};

exports.images = {
  test: /\.(svg|png|jpg|jpeg|gif|ico)(\?v=.*)?$/,
  loader: 'file?name=[path][name].[ext]',
  exclude: [/collab-amcharts/, /node_modules/],
};

exports.vendorImages = {
  test: /\.(svg|png|jpg|jpeg|gif|ico)(\?v=.*)?$/,
  loader: 'file?name=images/[name].[ext]',
  include: /node_modules/,
  exclude: /collab-amcharts/,
};

exports.dependencies = [{
  test: /jquery.js$/,
  loader: 'expose?$!expose?jQuery',
}, {
  test: /(FileSaver|fabric).js$/,
  loader: 'script',
}, {
  test: /(bootstrap-tokenfield).js$/,
  loader: 'imports?define=>false',
}, {
  test: /bard.js$/,
  loader: 'script',
}, {
  test: /\/sinon.js$/,
  loader: 'script',
}, {
  test: /jasmine-promise-matchers.js$/,
  loader: 'script',
}, {
  test: /bmmp\/cisco-bmmp.js$/,
  loader: 'script',
}];

exports.instrument = {
  test: /\.js$/,
  exclude: [
    /node_modules/,
    /spec\.js$/,
  ],
  loader: 'istanbul-instrumenter',
};
