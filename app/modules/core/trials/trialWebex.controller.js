(function () {
  'use strict';

  angular
    .module('core.trial')
    .controller('TrialWebexCtrl', TrialWebexCtrl);

  /* @ngInject */
  function TrialWebexCtrl($q, $scope, $translate, Analytics, TrialWebexService, TrialTimeZoneService) {
    var vm = this;

    var _trialData = TrialWebexService.getData();

    vm.details = _trialData.details;
    vm.siteUrl = _trialData.details.siteUrl;
    vm.validatingUrl = false;
    vm.validateSiteUrl = validateSiteUrl;
    vm.parentTrialData = $scope.trialData;

    vm.siteUrlFields = [{
      model: vm.details,
      key: 'siteUrl',
      type: 'cs-input',
      templateOptions: {
        required: true,
        labelClass: '',
        inputClass: '',
        label: $translate.instant('trialModal.meeting.siteUrl'),
        placeholder: $translate.instant('trialModal.meeting.siteUrlPlaceholder'),
      },
      modelOptions: {
        'updateOn': 'blur',
      },
      asyncValidators: {
        siteUrl: {
          expression: vm.validateSiteUrl,
          message: function () {
            var errors = {
              'domainInvalid': $translate.instant('trialModal.meeting.domainInvalid'),
              'duplicateSite': $translate.instant('trialModal.meeting.duplicateSite'),
              'invalidSite': $translate.instant('trialModal.meeting.invalidSite'),
            };

            return errors[vm.siteUrlErrorCode];
          },
        },
      },
    }];

    vm.timezoneFields = [{
      model: vm.details,
      key: 'timeZone',
      type: 'select',
      defaultValue: {
        'label': $translate.instant('trialModal.meeting.timeZonePlaceholder'),
        'timeZoneId': undefined,
      },
      templateOptions: {
        required: true,
        labelfield: 'label',
        labelProp: 'label',
        valueProp: 'timeZoneId',
        label: $translate.instant('trialModal.meeting.timezone'),
        filter: true,
      },
      expressionProperties: {
        'templateOptions.options': function () {
          var timeZones = TrialTimeZoneService.getTimeZones();
          return timeZones;
        },
      },
      validators: {
        'timezone': {
          expression: function ($viewValue, $modelValue) {
            var timezone = $modelValue || $viewValue;
            return !_.isUndefined(timezone.timeZoneId);
          },
        },
      },
    }];

    ////////////////

    Analytics.trackTrialSteps(Analytics.eventNames.ENTER_SCREEN, vm.parentTrialData);

    function validateSiteUrl($viewValue, $modelValue) {
      var siteUrl = $modelValue || $viewValue;
      if (!siteUrl) {
        return false;
      }
      vm.validatingUrl = true;
      return $q(function (resolve, reject) {
        TrialWebexService.validateSiteUrl(siteUrl).then(function (site) {
          vm.siteUrlErrorCode = site.errorCode;
          if (site.isValid) {
            resolve();
          } else {
            Analytics.trackTrialSteps(Analytics.eventNames.VALIDATION_ERROR, vm.parentTrialData, { 'value': site, 'error': site.errorCode });
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
