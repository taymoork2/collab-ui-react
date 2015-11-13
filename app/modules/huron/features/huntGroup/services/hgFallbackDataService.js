(function () {
  'use strict';

  /**
   * A factory to take care of fetching fallback destination
   * information like internal, external numbers or huron
   * users. And to check if there are valid for the user input.
   */
  angular
    .module('uc.hurondetails')
    .factory('HuntGroupFallbackDataService', HuntGroupFallbackDataService);

  /* @ngInject */

  function HuntGroupFallbackDataService(TelephoneNumberService, HuntGroupService, Notification, $q) {

    var isValidInternalNumber = false;
    var isValidExternalNumber = false;
    var fallbackNumber = '';
    var fallbackMember = '';

    return {
      isFallbackValid: isFallbackValid,
      validateFallbackNumber: validateFallbackNumber,
      setFallbackMember: setFallbackMember,
      getFallbackDestinationJSON: getFallbackDestinationJSON,
      reset: reset
    };

    ///////////////

    /**
     * Reset the single data service to its origin state.
     */
    function reset() {
      isValidInternalNumber = false;
      isValidExternalNumber = false;
      fallbackNumber = '';
      fallbackMember = '';
    }

    /**
     * Receive the type-ahead item from the UI as parameter and
     * returns a UI data modal.
     */
    function setFallbackMember(item) {
      fallbackNumber = undefined;
      fallbackMember = {
        member: item,
        number: "",
        sendToVoicemail: false
      };
      return fallbackMember;
    }

    /**
     * Return true if there is a valid internal or external or
     * Huron user available as the fallback destination.
     */
    function isFallbackValid() {
      return (
        isValidInternalNumber ||
        isValidExternalNumber ||
        (fallbackMember && fallbackMember !== ''));
    }

    /**
     * Validate the passed in number to see if it is a valid
     * internal or external number.
     */
    function validateFallbackNumber(number) {
      fallbackNumber = number;
      isValidInternalNumber = false;
      isValidExternalNumber = false;
      if (!validateExternalNumber()) {
        validateInternalNumber();
      }

      return fallbackNumber;
    }

    /**
     * This is the JSON data that will be used in POST &
     * PUT apis for the hunt group fallback destination object.
     */
    function getFallbackDestinationJSON() {
      var data = {};
      if (isValidInternalNumber || isValidExternalNumber) {
        data.fallbackDestination = {
          number: TelephoneNumberService.getDIDValue(fallbackNumber)
        };
      } else {
        data.fallbackDestination = {
          numberUuid: fallbackMember.member.selectableNumber.uuid,
          sendToVoicemail: fallbackMember.sendToVoicemail
        };
      }
      return data.fallbackDestination;
    }

    function validateExternalNumber() {
      if (TelephoneNumberService.validateDID(fallbackNumber)) {
        isValidExternalNumber = true;
        fallbackNumber = TelephoneNumberService.getDIDLabel(fallbackNumber);
      }
      return isValidExternalNumber;
    }

    function validateInternalNumber() {
      var validator = huronNumberBackendValidationNeeded();
      if (!validator) {
        return;
      }

      validator.setOnFailure(function (response) {
        Notification.errorResponse(response, 'huronHuntGroup.numberFetchFailure');
      });

      validator.fetch().then(function (data) {
        if (data.length > 0 && !isFallbackValid()) {
          data.some(function (n) {
            if (n.number === fallbackNumber) {
              isValidInternalNumber = true;
            }
            return isValidInternalNumber;
          });
        }
      });
    }

    function huronNumberBackendValidationNeeded() {
      if (!isNaN(parseFloat(fallbackNumber)) && isFinite(fallbackNumber)) {
        return HuntGroupService.isFallbackNumberValid(fallbackNumber);
      }
    }
  }
})();
