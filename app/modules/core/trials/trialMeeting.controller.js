(function () {
  'use strict';

  angular
    .module('core.trial')
    .controller('TrialMeetingCtrl', TrialMeetingCtrl);

  /* @ngInject */
  function TrialMeetingCtrl($translate, TrialMeetingService, WebexTimeZoneService) {
    var vm = this;

    var _trialData = TrialMeetingService.getData();

    vm.details = _trialData.details;
    vm.siteUrl = _trialData.details.siteUrl;
    vm.timeZoneId = _trialData.details.timeZoneId;
    vm.timeZones = [];

    vm.siteUrlFields = [{
      model: vm.details,
      key: 'siteUrl',
      type: 'input',
      templateOptions: {
        label: $translate.instant('trialModal.meeting.webexSiteUrl'),
        labelClass: 'small-4 columns',
        inputClass: 'small-7 columns left',
        placeholder: 'http://',
        type: 'url',
        required: true,
      },
    }];

    vm.timezoneFields = [{
      model: vm.details,
      key: 'timeZone',
      type: 'select',
      templateOptions: {
        required: true,
        labelfield: 'label',
        labelClass: 'small-4 columns',
        inputClass: 'small-7 columns left',
        filter: true,
        label: $translate.instant('trialModal.meeting.webexTimezone'),
        inputPlaceholder: $translate.instant('trialModal.meeting.timezonePlaceholder')
      },
      expressionProperties: {
        'templateOptions.options': function () {
          return vm.timeZones;
        }
      }
    }];

    init();

    ////////////////

    function init() {
      WebexTimeZoneService.getTimeZones().then(function (timeZones) {
        vm.timeZones = timeZones;
      });
    }
  }
})();
