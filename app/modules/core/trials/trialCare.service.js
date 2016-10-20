(function () {
  'use strict';

  angular
    .module('core.trial')
    .factory('TrialCareService', TrialCareService);

  /* @ngInject */
  function TrialCareService(Config) {
    var _trialData;
    var service = {
      getData: getData,
      reset: reset
    };

    return service;

    ////////////////

    function getData() {
      return _trialData || _makeTrial();
    }

    function reset() {
      _makeTrial();
    }

    function _makeTrial() {
      var defaults = {
        type: Config.offerTypes.care,
        enabled: false,
        details: {
          enabled: false,
          quantity: 15
        }
      };

      _trialData = angular.copy(defaults);
      return _trialData;
    }
  }
})();
