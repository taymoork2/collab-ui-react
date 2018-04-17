module.exports = {
  plugins: [
    require('autoprefixer')({
      browsers: ['last 2 version'],
    }),
    require('cssnano')({
      reduceIdents: false, // http://cssnano.co/optimisations/reduceidents/
    }),
  ],
};
