(function () {
  'use strict';

  angular
    .module('core.trial')
    .controller('TrialMeetingCtrl', TrialMeetingCtrl);

  /* @ngInject */
  function TrialMeetingCtrl($translate, TrialMeetingService) {
    var vm = this;

    var _trialData = TrialMeetingService.getData();

    vm.details = _trialData.details;
    vm.siteUrl = _trialData.details.siteUrl;
    vm.timeZoneId = _trialData.details.timeZoneId;

    vm.siteUrlFields = [{
      model: vm.details,
      key: 'siteUrl',
      type: 'input',
      templateOptions: {
        label: $translate.instant('trialModal.meeting.siteUrl'),
        labelClass: 'small-3 columns',
        inputClass: 'small-8 columns left',
        placeholder: 'http://',
        type: 'url',
        required: true,
      },
    }];

    vm.timezoneFields = [{
      model: vm.details,
      key: 'timeZoneId',
      type: 'select',
      templateOptions: {
        labelfield: 'label',
        required: true,
        label: $translate.instant('trialModal.meeting.timezone'),
        labelClass: 'small-3 columns',
        inputClass: 'small-8 columns left',
        //TODO: Demo data for now. Webex supposedly has a specific list.
        options: ['America/Los Angeles (UTC-08:00)', 'America/Denver (UTC-07:00)', 'America/Chicago (UTC-06:00)', 'America/New York (UTC-05:00)', 'Europe/London (UTC+00:00)', 'Europe/Berlin (UTC+01:00)', 'Asia/Jerusalem (UTC+02:00)', 'Asia/Kolkata (UTC+05:30)', 'Asia/Shanghai (UTC+08:00)'],
        placeholder: $translate.instant('trialModal.meeting.timezonePlaceholder'),
      }
    }];

    init();

    ////////////////

    function init() {}
  }
})();
