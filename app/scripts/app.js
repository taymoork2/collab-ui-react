(function () {
  'use strict';

  /* global window, document, MIXPANEL_CUSTOM_LIB_URL: false */

  /**
   * @ngdoc overview
   * @name adminPortalPocApp
   * @description
   * # adminPortalPocApp
   *
   * Main module of the application.
   */

  /** start Mixpanel, code from: https://mixpanel.com/help/reference/javascript **/
  /* eslint-disable no-unused-expressions */
  (function (e, b) {
    if (!b.__SV) {
      var a, f, i, g;
      window.mixpanel = b;
      b._i = [];
      b.init = function (a, e, d) {
        function f(b, h) {
          var a = h.split(".");
          2 == a.length && (b = b[a[0]], h = a[1]);
          b[h] = function () {
            b.push([h].concat(Array.prototype.slice.call(arguments, 0)));
          };
        }
        var c = b;
        "undefined" !== typeof d ? c = b[d] = [] : d = "mixpanel";
        c.people = c.people || [];
        c.toString = function (b) {
          var a = "mixpanel";
          "mixpanel" !== d && (a += "." + d);
          b || (a += " (stub)");
          return a;
        };
        c.people.toString = function () {
          return c.toString(1) + ".people (stub)";
        };
        i = "disable time_event track track_pageview track_links track_forms register register_once alias unregister identify name_tag set_config people.set people.set_once people.increment people.append people.union people.track_charge people.clear_charges people.delete_user".split(" ");
        for (g = 0; g < i.length; g++) {
          f(c, i[g]);
        }
        b._i.push([a, e, d]);
      };
      b.__SV = 1.2;
      a = e.createElement("script");
      a.type = "text/javascript";
      a.async = !0;
      a.src = "undefined" !== typeof MIXPANEL_CUSTOM_LIB_URL ? MIXPANEL_CUSTOM_LIB_URL : "https://cdn.mxpnl.com/libs/mixpanel-2-latest.min.js";
      f = e.getElementsByTagName("script")[0];
      f.parentNode.insertBefore(a, f);
    }
  })(document, window.mixpanel || []);
  /* eslint-enable no-unused-expressions */
  /** end Mixpanel **/

  require('./app.dependencies');

  angular.module('atlas.templates', []);
  // ngtemplate-loader will load templates into atlas.templates
  requireAll(require.context("modules/", true, /\.\/.*\.html$/));

  angular.module('wx2AdminWebClientApp', [
    require('modules/core/scripts/controllers/bodyCtrl'),
    require('modules/core/auth/auth'),
    require('modules/core/auth/token.service'),
    require('modules/core/config/config'),
    require('modules/core/featureToggle/featureToggle.service'),
    require('modules/core/l10n/languages'),
    require('modules/core/scripts/services/authinfo'),
    require('modules/core/scripts/services/storage'),
    require('modules/core/scripts/services/localize'),
    require('modules/core/scripts/services/utils'),
    require('modules/core/scripts/services/log'),
    require('modules/core/scripts/services/sessionstorage'),
    require('modules/core/scripts/services/logmetricsservice'),
    require('modules/core/scripts/services/responseinterceptor'),
    require('modules/core/scripts/services/readonly.interceptor'),
    require('modules/core/scripts/services/timingInterceptor'),
    require('modules/core/scripts/services/serverErrorInterceptor'),
    require('modules/core/stateRedirect/previousState.service'),
    require('modules/core/trackingId/trackingId.module'),
    'atlas.templates',
    'cisco.ui',
    'ct.ui.router.extras.sticky',
    'ct.ui.router.extras.future',
    'ct.ui.router.extras.previous',
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'oc.lazyLoad',
    'pascalprecht.translate',
    'ui.router',
  ]).run(require('./apprun'));
  require('./appconfig');

  function requireAll(requireContext) {
    return requireContext.keys().forEach(requireContext);
  }
}());
