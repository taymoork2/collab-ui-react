(function () {
  'use strict';

  angular
    .module('core.trial')
    .controller('TrialMeetingCtrl', TrialMeetingCtrl);

  /* @ngInject */
  function TrialMeetingCtrl($q, $translate, TrialMeetingService, WebexTrialService) {
    var vm = this;

    var _trialData = TrialMeetingService.getData();

    vm.details = _trialData.details;
    vm.siteUrl = _trialData.details.siteUrl;
    vm.validatingUrl = false;
    vm.validateSiteUrl = validateSiteUrl;

    vm.siteUrlFields = [{
      model: vm.details,
      key: 'siteUrl',
      type: 'input',
      templateOptions: {
        required: true,
        labelClass: 'small-2 columns',
        inputClass: 'small-9 columns left',
        label: $translate.instant('trialModal.meeting.siteUrl'),
        placeholder: $translate.instant('trialModal.meeting.siteUrlPlaceholder')
      },
      modelOptions: {
        'updateOn': 'blur'
      },
      asyncValidators: {
        siteUrl: {
          expression: vm.validateSiteUrl,
          message: function () {
            var errors = {
              'domainInvalid': $translate.instant('trialModal.meeting.domainInvalid'),
              'duplicateSite': $translate.instant('trialModal.meeting.duplicateSite'),
              'invalidSite': $translate.instant('trialModal.meeting.invalidSite')
            };

            return errors[vm.siteUrlErrorCode];
          }
        }
      },
    }];

    vm.timezoneFields = [{
      model: vm.details,
      key: 'timeZone',
      type: 'select',
      defaultValue: '',
      templateOptions: {
        required: true,
        labelfield: 'label',
        labelClass: 'small-2 columns',
        inputClass: 'small-9 columns left',
        labelProp: 'label',
        valueProp: 'value',
        label: $translate.instant('trialModal.meeting.timezone')
      },
      expressionProperties: {
        'templateOptions.options': function () {
          var validTimeZoneIds = ['4', '7', '11', '17', '45', '41', '25', '28'];
          var timeZones = WebexTrialService.getTimeZones();
          return _.filter(timeZones, function (timeZone) {
            return _.includes(validTimeZoneIds, timeZone.timeZoneId);
          });
        }
      }
    }];

    ////////////////

    function validateSiteUrl($viewValue, $modelValue) {
      var siteUrl = $modelValue || $viewValue;
      if (!siteUrl) {
        return false;
      }
      vm.validatingUrl = true;
      return $q(function (resolve, reject) {
        WebexTrialService.validateSiteUrl(siteUrl).then(function (site) {
            vm.siteUrlErrorCode = site.errorCode;
            if (site.isValid) {
              resolve();
            } else {
              reject();
            }
          })
          .catch(function () {
            reject();
          })
          .finally(function () {
            vm.validatingUrl = false;
          });
      });
    }
  }
})();
