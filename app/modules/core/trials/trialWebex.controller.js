(function () {
  'use strict';

  angular
    .module('core.trial')
    .controller('TrialWebexCtrl', TrialWebexCtrl);


  /* @ngInject */
  function TrialWebexCtrl($q, $scope, $translate, Analytics, Config, TrialWebexService, TrialTimeZoneService) {
    var vm = this;
    var _trialData = TrialWebexService.getData();
    var webexSiteValidationSource = Config.shallowValidationSourceTypes.serviceSetup;

    vm.details = _trialData.details;
    vm.validatingUrl = false;
    vm.validateSiteUrl = validateSiteUrl;
    vm.parentTrialData = $scope.trialData;
    vm.getTimeZones = getTimeZones;
    vm.timeZones = getTimeZones();
    vm.details.timeZone = vm.details.timeZone || '';

    vm.getTimeZones = getTimeZones;
    vm._helpers = {
      getNumericPortion: getNumericPortion,
      sortTimeZones: sortTimeZones,
    };

    vm.timeZoneInput = {
      inputPlaceholder: $translate.instant('trialModal.meeting.timezone'),
      placeholder: $translate.instant('trialModal.meeting.timeZonePlaceholder'),
    };

    vm.errorMessages = {
      site: '',
      required: $translate.instant('common.required'),
    };

    vm.siteUrlValidator = {
      site: validateSiteUrl,
    };

    Analytics.trackTrialSteps(Analytics.eventNames.ENTER_SCREEN, vm.parentTrialData);

    function getNumericPortion(gmtLabel) {
      // match offset component
      var offset = /[+-]\d\d:\d\d/.exec(gmtLabel);
      // use matched value, or default to '0'
      var gmtOffset = _.get(offset, 0, '0');
      // remove the ':', and convert to int
      gmtOffset = gmtOffset.replace(':', '');
      return _.parseInt(gmtOffset);
    }

    function sortTimeZones(x, y) {
      //sort in assending order
      var x_numeric = getNumericPortion(x.label);
      var y_numeric = getNumericPortion(y.label);
      return x_numeric - y_numeric;
    }

    function getTimeZones() {
      var timeZones = TrialTimeZoneService.getTimeZones().sort(sortTimeZones);
      return timeZones;
    }


    function validateSiteUrl(modelValue, viewValue) {
      var validationErrorsSite = {
        domainInvalid: $translate.instant('trialModal.meeting.domainInvalid'),
        duplicateSite: $translate.instant('trialModal.meeting.duplicateSite'),
        invalidSite: $translate.instant('trialModal.meeting.invalidSite'),
      };

      return $q(function (resolve, reject) {
        vm.validatingUrl = true;
        TrialWebexService.validateSiteUrl(viewValue, webexSiteValidationSource)
          .then(function (result) {
            if (result.isValid) {
              resolve();
            } else {
              vm.errorMessages.site = validationErrorsSite[result.errorCode];
              Analytics.trackTrialSteps(Analytics.eventNames.VALIDATION_ERROR, vm.parentTrialData, { value: result, error: result.errorCode });
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
