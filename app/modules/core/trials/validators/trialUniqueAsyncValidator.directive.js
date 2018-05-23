(function () {
  'use strict';

  angular.module('core.trial')
    .directive('trialUniqueAsyncValidator', TrialUniqueAsyncValidator);

  function TrialUniqueAsyncValidator($parse, $q, $translate, TrialService) {
    return {
      require: 'ngModel',
      link: function (scope, elm, attrs, ngModelCtrl) {
        var params = $parse(attrs.trialUniqueAsyncValidator)(scope);
        //might need to modify error message depending on the server response
        var messages = scope.$eval(attrs.messages);
        var warnObj;
        if (!_.isUndefined(attrs.trialUniqueAsyncWarningObj)) {
          warnObj = scope.$eval(attrs.trialUniqueAsyncWarningObj);
        }
        ngModelCtrl.$asyncValidators.trialUniqueAsyncValidator = function (modelValue, viewValue) {
          return $q(function (resolve, reject) {
            validateField(viewValue, scope, params.key).then(function (result) {
              if (result.valid) {
                if (!_.isUndefined(warnObj)) {
                  if (_.isUndefined(result.warning)) {
                    warnObj.show = false;
                  } else {
                    warnObj.show = true;
                    warnObj.message = $translate.instant(result.warning);
                  }
                }
                resolve();
              } else {
                if (!_.isUndefined(warnObj)) {
                  warnObj.show = false;
                }
                messages.trialUniqueAsyncValidator = $translate.instant(result.error);
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
          return { valid: true, warning: response.warning };
        }
        return { valid: false, error: response.error };
      });
    }
  }
})();
