require('angular-animate/angular-animate.js');
require('angular-cookies/angular-cookies.js');
require('angular-sanitize/angular-sanitize.js');
require('angular-resource/angular-resource.js');
require('angular-messages/angular-messages.js');
require('angular-translate/dist/angular-translate.js');
require('angular-translate-loader-static-files/angular-translate-loader-static-files.js');
require('messageformat/messageformat.js');
requireAll(require.context('messageformat/locale', false, /.js$/));
require('angular-translate-interpolation-messageformat/angular-translate-interpolation-messageformat.js');
require('angular-ui-router/release/angular-ui-router.js');
require('ui-router-extras/release/modular/ct-ui-router-extras.core.js');
require('ui-router-extras/release/modular/ct-ui-router-extras.sticky.js');
require('ui-router-extras/release/modular/ct-ui-router-extras.transition.js');
require('ui-router-extras/release/modular/ct-ui-router-extras.future.js');
require('ui-router-extras/release/modular/ct-ui-router-extras.previous.js');
require('collab-ui-angular/dist/collab-ui.js');
require('angularjs-toaster/toaster.js');
require('oclazyload');
require('dragular/dist/dragular.js');

function requireAll(requireContext) {
  return requireContext.keys().forEach(requireContext);
}
