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
      setFallbackDestinationJSON: setFallbackDestinationJSON,
      reset: reset,
      isFallbackValidNumber: isFallbackValidNumber,
      isFallbackValidMember: isFallbackValidMember,
      getFallbackNumber: getFallbackNumber,
      getFallbackMember: getFallbackMember
    };

    ///////////////

    function getFallbackNumber() {
      return fallbackNumber;
    }

    function getFallbackMember() {
      return fallbackMember;
    }

    /**
     * This is the JSON data for fallbackDestination field that is
     * returned by GET on /huntgroups/{id}. And in turn constructs
     * the data modal to be used by UI.
     */
    function setFallbackDestinationJSON(data) {
      if (!data) {
        return;
      }

      reset();
      setFallbackNumberFromJSON(data);
      if (!isFallbackValid()) {
        setFallbackMemberFromJSON(data);
      }
    }

    function setFallbackNumberFromJSON(data) {
      if (data.number && data.number !== '') {
        fallbackNumber = data.number;

        if (!validateExternalNumber()) {
          isValidInternalNumber = true;
        }
      }
    }

    function setFallbackMemberFromJSON(data) {
      fallbackMember = {
        member: {
          user: {
            uuid: data.userUuid
          },
          selectableNumber: {
            uuid: data.numberUuid
          }
        },
        sendToVoicemail: data.sendToVoicemail
      };

      var names = data.userName.split(" ");
      fallbackMember.member.user.firstName = names[0];
      if (names.length > 1) {
        fallbackMember.member.user.lastName = names[1];
      }
    }

    function isFallbackValidMember() {
      return (fallbackMember && fallbackMember !== '');
    }

    function isFallbackValidNumber() {
      return (isValidInternalNumber || isValidExternalNumber);
    }

    /**
     * Return true if there is a valid internal or external or
     * Huron user available as the fallback destination.
     */
    function isFallbackValid() {
      return (isFallbackValidNumber() || isFallbackValidMember());
    }

    /**
     * Reset the single data service to its origin state.
     */
    function reset() {
      isValidInternalNumber = false;
      isValidExternalNumber = false;
      fallbackNumber = undefined;
      fallbackMember = undefined;
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
