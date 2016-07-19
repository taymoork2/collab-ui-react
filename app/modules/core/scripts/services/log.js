(function () {
  'use strict';

  /* eslint no-console:0 */

  angular.module('Core')
    .service('Log', Log);

  /* @ngInject */
  function Log($rootScope, Config) {
    var Log = function (type, msg, data) {
      if (enableLogging()) {
        if (!type) type = 'log';
        console[type](msg);
        if (data) console[type](JSON.stringify(data, null, 2));
      }
    };

    function enableLogging() {
      return $rootScope.debug || Config.isE2E();
    }

    _.each(['debug', 'info', 'log', 'warn', 'error'], function (type) {
      Log[type] = _.partial(Log, type);
    });

    return Log;
  }
})();
