(function () {
  'use strict';

  require('./main.dependencies');

  angular.module('Core', [
    'angular-cache',
    require('scripts/app.templates'),
    require('collab-ui-ng').default,
    'cisco.formly',
    require('modules/core/auth/tos').default,
    require('modules/core/auth/user').default,
    require('modules/core/auth/auth'),
    require('modules/core/auth/token.service'),
    require('modules/core/modal').default,
    'core.body',
    'core.chartColors',
    'core.languages',
    'core.localize',
    'core.logmetricsservice',
    require('modules/core/notifications').default,
    'core.onboard',
    'core.pageparam',
    'core.previousstate',
    'core.trackingId',
    'core.itProPack',
    'core.trial',
    'core.utils',
    'csDonut',
    'ct.ui.router.extras.previous',
    'ngAnimate',
    'ngclipboard',
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'ngMessages',
    'ngFileUpload',
    'ngCsv',
    require('angular-translate'),
    'ui.router',
    'ui.grid',
    'ui.grid.selection',
    'ui.grid.saveState',
    'ui.grid.infiniteScroll',
    'ui.grid.pagination',
    'timer',
    'toaster',
    'rzModule',
    'dragularModule',
    require('modules/core/users/userOverview').default,
    require('modules/core/analytics'),
    require('modules/core/featureToggle').default,
    require('modules/core/focus').default,
    require('modules/core/inlineEditText').default,
    require('modules/core/learnMore').default,
    require('modules/core/scrollIndicator').default,
    require('modules/core/gridSpinner').default,
    require('modules/core/scripts/services/org.service'),
    require('modules/core/scripts/services/userlist.service'),
    require('modules/core/scripts/services/brand.service'),
    require('modules/core/scripts/services/sparkDomainManagement.service'),
    require('modules/core/users/userCsv/userCsv.service'),
    require('modules/core/scripts/services/retention.service'),
    require('modules/core/myCompany/mySubscriptions').default,
    require('modules/core/cards').default,
    require('modules/core/customerReports/sparkReports').default,
    require('modules/core/partnerReports/commonReportServices').default,
    require('modules/core/partnerReports/reportCard').default,
    require('modules/core/partnerReports/reportFilter').default,
    require('modules/core/partnerReports/reportSlider').default,
    require('modules/core/partnerProfile/branding').default,
    require('modules/core/window').default,
    require('modules/online/digitalRiver').default, // TODO make core.myCompany independent module
    require('modules/online/upgrade').default,
    require('modules/core/trials/regionalSettings').default,
    require('modules/core/trials/emergencyServices').default,
    require('modules/core/settings').default,
    require('modules/huron/countries').default,
    require('modules/huron/settings').default,
    require('modules/huron/dialPlans').default,
    require('modules/core/domainManagement').default,
    require('modules/huron/features/featureLanding/hoverDelay.directive').default,
    require('modules/core/validation').default,
  ])
    .constant('CryptoJS', require('crypto-js'))
    .constant('addressparser', require('emailjs-addressparser'));

  // TODO fix circular dependencies between modules
  angular.module('Squared', ['Core', 'Hercules', 'Huron', 'Sunlight',
    require('modules/squared/devices/services/CsdmPoller')]);

  angular.module('DigitalRiver', ['Core']);

  angular.module('Huron', [
    'Core',
    'uc.device',
    'uc.didadd',
    'uc.overview',
    'uc.hurondetails',
    'uc.cdrlogsupport',
    'uc.autoattendant',
    'ngIcal',
    'huron.paging-group',
    'huron.call-pickup.setup-assistant',
    'huron.call-park',
    'huron.bulk-enable-vm',
    'huron.TerminusServices',
    'huron.externalNumberService',
    require('modules/huron/telephony/telephonyConfig'),
    require('modules/huron/telephony/cmiServices'),
    require('modules/huron/autoAnswer').default,
    require('modules/huron/pstn').default,
    require('modules/huron/pstnSetup/pstnSelector').default,
    require('modules/huron/overview').default,
    require('modules/huron/lines/deleteExternalNumber').default,
  ])
  .constant('ASTParser', require('acorn'))
  .constant('ASTWalker', require('acorn/dist/walk'));

  angular.module('Hercules', [
    'Core',
    'Squared',
    'core.onboard',
    'ngTagsInput',
    require('modules/hercules/private-trunk/private-trunk-setup').default,
    require('modules/hercules/private-trunk/private-trunk-overview-settings').default,
    require('modules/hercules/service-settings/calendar-service-setup').default,
    require('modules/hercules/google-calendar-settings/google-calendar-config-section/google-calendar-second-time-setup').default,
    require('modules/hercules/services/hybrid-services-i18n.service').default,
    require('modules/hercules/services/hybrid-services-utils.service').default,
    require('modules/hercules/services/excel-service').default,
    require('modules/hercules/services/service-descriptor'),
    require('modules/hercules/services/uss-service'),
    require('modules/hercules/services/service-descriptor'),
  ]);

  angular.module('HDS', ['Core', 'Hercules']);

  angular.module('Ediscovery', ['Core']);

  angular.module('Mediafusion', ['Core', 'Hercules', 'Squared']);

  angular.module('WebExApp', [
    'Core',
    require('modules/webex/utils').default,
    require('modules/webex/xmlApi').default,
    require('modules/webex/webexClientVersions/webexClientVersion.svc'),
  ]);

  angular.module('Messenger', [
    'Core',
    require('modules/shared').default,
  ]);

  angular.module('Sunlight', [
    'Core',
    'CareDetails',
    'Sunlight.pagination',
    require('modules/sunlight/services').default,
  ]);

  angular.module('Context', ['Core']);

  angular.module('GSS', ['Core']);

  angular.module('Gemini', ['Core']);

  angular.module('CMC', [
    'Core',
    require('modules/cmc').default,
  ]);

  module.exports = angular.module('Main', [
    'Core',
    'Squared',
    'DigitalRiver',
    'Huron',
    'Hercules',
    'Ediscovery',
    'Mediafusion',
    'HDS',
    'WebExApp',
    'Messenger',
    'Sunlight',
    'Context',
    'GSS',
    'oc.lazyLoad',
    'Gemini',
    'CMC',
  ]).config(require('./main.config'))
    .run(require('./main.run'))
    .name;

  // require all modules first
  requireAll(require.context("modules/", true, /\.module\.(js|ts)$/));
  // require all other app files - ignore bootstrap.js, preload.js, newrelic
  requireAll(require.context("../", true, /\.\/(?!.*(\.spec|bootstrap.js$|scripts\/preload.js$|\/newrelic\/.*.js$)).*\.(js|ts)$/));
  // require all other assets
  requireAll(require.context("../", true, /\.(jpg|png|svg|ico|json|csv|pdf)$/));

  function requireAll(requireContext) {
    return requireContext.keys().map(requireContext);
  }
}());
