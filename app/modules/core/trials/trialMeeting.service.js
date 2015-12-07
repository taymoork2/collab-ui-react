(function () {
  'use strict';

  angular
    .module('core.trial')
    .factory('TrialMeetingService', TrialMeetingService);

  /* @ngInject */
  function TrialMeetingService(Config) {
    var _trialData;
    var service = {
      'getData': getData,
      'reset': reset,
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
        'type': Config.trials.meeting,
        'enabled': false,
        'readonly': false,
        'details': {
          'siteUrl': '',
          'timezone': '',
          'setDefault': true
        },
      };

      _trialData = angular.copy(defaults);
      return _trialData;
    }
  }
})();
