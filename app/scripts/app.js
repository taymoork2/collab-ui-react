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

  (function (l, y, t, i, c, s) {
    l['LocalyticsGlobal'] = i;
    l[i] = function () {
      (l[i].q = l[i].q || []).push(arguments);
    };
    l[i].t = +new Date();
    (s = y.createElement(t)).type = 'text/javascript';
    s.src = '//web.localytics.com/v3/localytics.min.js';
    (c = y.getElementsByTagName(t)[0]).parentNode.insertBefore(s, c);
    window.ll('init', 'f725f885fe2646751d3c8a3-075b0c4e-a82c-11e5-c7e0-00d0fea82624', {});
  }(window, document, 'script', 'll'));

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
      a.src = "undefined" !== typeof MIXPANEL_CUSTOM_LIB_URL ? MIXPANEL_CUSTOM_LIB_URL : "file:" === e.location.protocol && "//cdn.mxpnl.com/libs/mixpanel-2-latest.min.js".match(/^\/\//) ? "https://cdn.mxpnl.com/libs/mixpanel-2-latest.min.js" : "//cdn.mxpnl.com/libs/mixpanel-2-latest.min.js";
      f = e.getElementsByTagName("script")[0];
      f.parentNode.insertBefore(a, f);
    }
  })(document, window.mixpanel || []);
  /* eslint-enable no-unused-expressions */
  /** end Mixpanel **/

  angular.module('Core', [
      'angular-cache',
      'cisco.ui',
      'cisco.formly',
      'core.trial',
      'core.onboard',
      'csDonut',
      'ct.ui.router.extras.sticky',
      'ct.ui.router.extras.future',
      'ct.ui.router.extras.previous',
      'cwill747.phonenumber',
      'ngAnimate',
      'ngclipboard',
      'ngCookies',
      'ngResource',
      'ngSanitize',
      'ngMessages',
      'ngFileUpload',
      'ngCsv',
      'pascalprecht.translate',
      'templates-app',
      'ui.router',
      'ui.grid',
      'ui.grid.selection',
      'ui.grid.saveState',
      'ui.grid.infiniteScroll',
      'timer',
      'toaster'
    ])
    .constant('pako', window.pako)
    .constant('addressparser', window['emailjs-addressparser']);

  angular.module('Squared', ['Core']);

  angular.module('Huron', [
    'Core',
    'uc.moh',
    'uc.device',
    'uc.callrouting',
    'uc.didadd',
    'uc.overview',
    'uc.hurondetails',
    'uc.cdrlogsupport',
    'ngIcal'
  ]);

  angular.module('Hercules', ['Core', 'core.onboard', 'ngTagsInput']);

  angular.module('Ediscovery', ['Core']);

  angular.module('Mediafusion', ['Core']);

  angular.module('WebExApp', ['Core']);

  angular.module('Messenger', ['Core']);

  angular.module('Sunlight', [
    'Core',
    'CareDetails'
  ]);

  angular.module('wx2AdminWebClientApp', [
    'Core',
    'Squared',
    'Huron',
    'Hercules',
    'Ediscovery',
    'Mediafusion',
    'WebExApp',
    'Messenger',
    'Sunlight'
  ]);
}());
