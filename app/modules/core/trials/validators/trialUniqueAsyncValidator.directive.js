(function () {
  'use strict';

  angular.module('core.trial')
    .directive('trialUniqueAsyncValidator', TrialUniqueAsyncValidator);

  function TrialUniqueAsyncValidator($parse, $q, $translate, TrialService) {
    return {
      require: 'ngModel',
      link: function (scope, elm, attrs, ngModelCtrl) {
        var params = $parse(attrs.trialUniqueAsyncValidator)(scope);
        var messages = scope.$eval(attrs.messages);
        var status = messages[attrs.name] = {};

        ngModelCtrl.$asyncValidators.trialUniqueAsyncValidator = function (modelValue, viewValue) {
          return $q(function (resolve, reject) {
            validateField(viewValue, scope, params.key).then(function (result) {
              if (result.valid) {
                if (_.isUndefined(result.message)) {
                  status.warning = undefined;
                } else {
                  status.warning = $translate.instant(result.message);
                }
                resolve();
              } else {
                status.warning = undefined;
                status.error = $translate.instant(result.message);
                reject();
              }
            });
          });
        };
      },
    };

    function validateField(viewValue, scope, key) {
      return TrialService.shallowValidation(key, viewValue).then(function (response) {
        if (!_.isUndefined(response.unique)) {
          return { valid: true, message: response.warning };
        }
        return { valid: false, message: response.error };
      });
    }
  }
})();
