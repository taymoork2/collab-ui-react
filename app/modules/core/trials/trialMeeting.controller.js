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
    vm.timezone = _trialData.details.timezone;

    vm.siteUrlFields = [{
      model: vm.details,
      key: 'siteUrl',
      type: 'input',
      templateOptions: {
        label: $translate.instant('trialModal.meeting.siteUrl'),
        labelClass: 'small-3 columns',
        inputClass: 'small-8 columns left',
        type: 'url',
        required: true,
      },
    }];

    vm.timezoneFields = [{
      model: vm.details,
      key: 'setDefault',
      type: 'checkbox',
      hide: true,
      templateOptions: {
        label: $translate.instant('trialModal.meeting.default'),
        id: 'setTimezoneDefault',
        class: 'small-offset-1 columns',
      },
    }, {
      model: vm.details,
      key: 'timezone',
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
      },
      expressionProperties: {
        'templateOptions.disabled': function () {
          // Keep select disabled if default setting is enabled
          // return vm.details.setDefault;
        }
      },
    }];

    init();

    ////////////////

    function init() {}
  }
})();
