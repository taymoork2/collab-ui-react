(function () {
  'use strict';

  module.exports = MainRun;

  /* @ngInject */
  function MainRun($translate, formlyValidationMessages) {
    // This is where standard form field validation messages are defined.  Any overrides need to be
    // done in individual controllers.  Using promise returned from $translate service to ensure
    // translation file is loaded before adding messages to formly.
    $translate('common.invalidRequired').then(function (requiredMessage) {
      formlyValidationMessages.addStringMessage('required', requiredMessage);
    });

    $translate('common.invalidEmail').then(function (emailMessage) {
      formlyValidationMessages.addStringMessage('email', emailMessage);
    });

    $translate('common.invalidUrl').then(function (urlMessage) {
      formlyValidationMessages.addStringMessage('url', urlMessage);
    });

    $translate('common.invalidPhoneNumber').then(function (phoneNumberMessage) {
      formlyValidationMessages.addStringMessage('phoneNumber', phoneNumberMessage);
    });

    formlyValidationMessages.messages.minlength = getMinLengthMessage;
    formlyValidationMessages.messages.maxlength = getMaxLengthMessage;
    formlyValidationMessages.messages.max = getMaxMessage;

    function getMinLengthMessage($viewValue, $modelValue, scope) {
      return $translate.instant('common.invalidMinLength', {
        min: function () {
          return scope.options.templateOptions.minlength;
        }
      });
    }

    function getMaxLengthMessage($viewValue, $modelValue, scope) {
      return $translate.instant('common.invalidMaxLength', {
        max: function () {
          return scope.options.templateOptions.maxlength;
        }
      });
    }

    function getMaxMessage($viewValue, $modelValue, scope) {
      return $translate.instant('common.invalidMax', {
        max: scope.options.templateOptions.max
      });
    }

  }
}());
