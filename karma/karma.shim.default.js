require('./karma.shim.common.js');

requireAll(require.context('../app', true, /\.spec\.(js|ts)$/));

function requireAll(requireContext) {
  return requireContext.keys().forEach(requireContext);
}
