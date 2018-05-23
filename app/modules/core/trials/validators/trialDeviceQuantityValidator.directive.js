(function () {
  'use strict';

  angular.module('core.trial')
    .directive('trialDeviceQuantityValidator', TrialDeviceQuantityValidator);

  function TrialDeviceQuantityValidator($parse, $translate) {
    return {
      require: 'ngModel',
      link: function (scope, elm, attrs, ngModelCtrl) {
        var params = $parse(attrs.trialDeviceQuantityValidator)(scope);
        var deviceType = params.type;
        var deviceName = params.name;
        var container = scope.$parent.callTrial;
        var device = container[deviceName];
        var messages = scope.$eval(attrs.errorMessages) || {};

        scope.$watch(function () {
          return container.getTotalQuantity();
        }, function () {
          ngModelCtrl.$validate();
        });

        ngModelCtrl.$validators.trialDeviceQuantityValidator = function ($viewValue) {
          var limit = container.deviceLimit;
          var typeLimit = limit[deviceType];
          var totalLimit = limit.totalDevices;
          var deviceLimit = limit[device.model];

          var deviceDisabled = container.areTemplateOptionsDisabled(container[deviceName]);
          if (deviceDisabled) {
            messages.trialDeviceQuantityValidator = '';
            return true;
          }

          if (!validateQuantity($viewValue, deviceLimit)) {
            if (deviceLimit.min === deviceLimit.max) {
              messages.trialDeviceQuantityValidator = $translate.instant('trialModal.call.invalidQuantitySingle', { qty: deviceLimit.min });
            } else {
              messages.trialDeviceQuantityValidator = $translate.instant('trialModal.call.invalidQuantity', { min: deviceLimit.min, max: deviceLimit.max });
            }
            return false;
          }

          if (!validateQuantity(container.getTypeQuantity(deviceType), typeLimit)) {
            messages.trialDeviceQuantityValidator = $translate.instant(typeLimit.errorMessage, { max: typeLimit.max });
            return false;
          }
          if (!validateQuantity(container.getTotalQuantity(), totalLimit)) {
            messages.trialDeviceQuantityValidator = $translate.instant('trialModal.call.invalidTotalQuantity', { min: totalLimit.min, max: totalLimit.max });
            return false;
          }
          messages.trialDeviceQuantityValidator = '';
          return true;
        };
      },
    };

    function validateQuantity(typeQuantity, limit) {
      return !(typeQuantity < limit.min || typeQuantity > limit.max);
    }
  }
})();
