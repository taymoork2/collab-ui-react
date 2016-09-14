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

  function HuntGroupFallbackDataService(TelephoneNumberService, HuntGroupService, Notification, $q, DirectoryNumberService,
    DialPlanService, Authinfo) {

    var isValidInternalNumber = false;
    var isValidExternalNumber = false;
    var fallbackNumber;
    var fallbackMember;
    var pristineFallbackMember;

    return {
      isFallbackInvalid: isFallbackInvalid,
      validateFallbackNumber: validateFallbackNumber,
      setFallbackMember: setFallbackMember,
      removeFallbackMember: removeFallbackMember,
      getFallbackDestinationJSON: getFallbackDestinationJSON,
      setFallbackDestinationJSON: setFallbackDestinationJSON,
      reset: reset,
      isFallbackValidNumber: isFallbackValidNumber,
      isFallbackValidMember: isFallbackValidMember,
      getFallbackNumber: getFallbackNumber,
      getFallbackMember: getFallbackMember,
      isFallbackDirty: isFallbackDirty,
      setAsPristine: setAsPristine,
      isVoicemailDisabled: isVoicemailDisabled,
      allowLocalValidation: allowLocalValidation
    };

    ////////////////

    function removeFallbackMember() {
      reset(false);
      return fallbackMember;
    }

    function setAsPristine() {
      if (fallbackMember) {
        pristineFallbackMember = angular.copy(fallbackMember.member);
      }
    }

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
    function setFallbackDestinationJSON(data, resetFromBackend) {
      if (!data) {
        return;
      }

      var asyncTask = $q.defer();
      reset(resetFromBackend);
      setFallbackNumberFromJSON(data);
      if (isFallbackInvalid()) {
        setFallbackMemberFromJSON(data, resetFromBackend, asyncTask);
      } else {
        asyncTask.resolve();
      }
      return asyncTask.promise;
    }

    function setFallbackNumberFromJSON(data) {
      if (data.number && data.number !== '') {
        fallbackNumber = data.number;

        if (!validateExternalNumber()) {
          isValidInternalNumber = true;
        }
      }
    }

    function setFallbackMemberFromJSON(fallbackJSON, resetFromBackend, asyncTask) {
      fallbackMember = {
        sendToVoicemail: fallbackJSON.sendToVoicemail
      };

      if (resetFromBackend) {
        HuntGroupService.getHuntMemberWithSelectedNumber(fallbackJSON).then(function (m) {
          pristineFallbackMember = m;
          fallbackMember.member = angular.copy(pristineFallbackMember);
          asyncTask.resolve();
        }, function (error) {
          Notification.errorResponse(error, 'huronHuntGroup.memberFetchFailure');
          asyncTask.reject();
        });
      } else {
        fallbackMember.member = angular.copy(pristineFallbackMember);
        asyncTask.resolve();
      }
    }

    function isFallbackValidMember() {
      return (fallbackMember);
    }

    function isFallbackValidNumber() {
      return (isValidInternalNumber || isValidExternalNumber);
    }

    /**
     * Return true if there is no valid internal/external
     * and no valid Huron user available as the fallback destination.
     */
    function isFallbackInvalid() {
      return (!isFallbackValidNumber() && !isFallbackValidMember());
    }

    /**
     * Reset the single data service to its origin state.
     */
    function reset(resetFromBackend) {
      isValidInternalNumber = false;
      isValidExternalNumber = false;
      fallbackNumber = undefined;
      fallbackMember = undefined;

      if (resetFromBackend) {
        pristineFallbackMember = undefined;
      }
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
    function getFallbackDestinationJSON(allowLocalValidation) {
      var data = {};
      if (isValidInternalNumber || isValidExternalNumber) {
        data.fallbackDestination = {
          number: TelephoneNumberService.getDIDValue(fallbackNumber)
        };
      } else if ((!isValidInternalNumber || !isValidExternalNumber)
        && allowLocalValidation && _.isUndefined(fallbackMember)) {
        data.fallbackDestination = {
          number: fallbackNumber
        };
      } else {
        data.fallbackDestination = {
          numberUuid: fallbackMemberNumberUuid(),
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
        if (data.length > 0 && isFallbackInvalid()) {
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

    function isFallbackDirty(pristineFallbackJSON) {
      if (pristineFallbackJSON.number &&
        pristineFallbackJSON.number !== '') {
        return (pristineFallbackJSON.number !==
          TelephoneNumberService.getDIDValue(fallbackNumber));
      }

      if (pristineFallbackJSON.numberUuid) {
        return memberNumberChanged(pristineFallbackJSON) ||
          memberSendToVoicemailChanged(pristineFallbackJSON);
      }
    }

    function fallbackMemberNumberUuid() {
      if (fallbackMember) {
        return fallbackMember.member.selectableNumber.uuid;
      }
    }

    function memberNumberChanged(pristineFallbackJSON) {
      return (pristineFallbackJSON.numberUuid !== fallbackMemberNumberUuid());
    }

    function memberSendToVoicemailChanged(pristineFallbackJSON) {
      return (pristineFallbackJSON.sendToVoicemail !==
        fallbackMember.sendToVoicemail);
    }

    function isVoicemailDisabled(customerId, fallbackUuid) {
      return DirectoryNumberService.get({
        customerId: customerId,
        directoryNumberId: fallbackUuid
      }).$promise.then(function (data) {
        return !data.voiceMailProfile;
      });
    }

    function allowLocalValidation() {
      return DialPlanService.getCustomerVoice(Authinfo.getOrgId()).then(function (response) {
        return !!response.regionCode;
      });
    }
  }
})();
