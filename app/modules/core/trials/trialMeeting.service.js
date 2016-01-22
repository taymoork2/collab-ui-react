(function () {
  'use strict';

  angular
    .module('core.trial')
    .factory('TrialMeetingService', TrialMeetingService);

  /* @ngInject */
  function TrialMeetingService($translate, Config) {
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
        'type': Config.offerTypes.meetings,
        'enabled': false,
        'details': {
          'siteUrl': '',
          'timeZone': {
            'label': $translate.instant('trialModal.meeting.timeZonePlaceholder'),
            'value': ''
          }
        }
      };

      _trialData = angular.copy(defaults);
      return _trialData;
    }
  }
})();
