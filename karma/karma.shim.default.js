require('./karma.shim.common.js');
require('./karma.shim.atlas.js');

requireAll(require.context('../app', true, /\.spec\.(js|ts)$/));

function requireAll(requireContext) {
  return requireContext.keys().forEach(requireContext);
}
