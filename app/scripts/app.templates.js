module.exports = angular.module('atlas.templates', []).name;
// ngtemplate-loader will load templates into atlas.templates
requireAll(require.context('modules/', true, /\.\/.*\.html$/));

function requireAll(requireContext) {
  return requireContext.keys().map(requireContext);
}
