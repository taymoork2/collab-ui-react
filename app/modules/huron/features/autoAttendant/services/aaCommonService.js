(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .factory('AACommonService', AACommonService);

  function AACommonService() {

    var aaSayMessageForm = false;
    var aaPhoneMenuOptions = false;
    var aaActionStatus = false;
    var aaDialByExtensionStatus = false;

    var invalidList = {};
    var service = {
      isFormDirty: isFormDirty,
      setSayMessageStatus: setSayMessageStatus,
      setPhoneMenuStatus: setPhoneMenuStatus,
      setActionStatus: setActionStatus,
      setDialByExtensionStatus: setDialByExtensionStatus,
      isValid: isValid,
      setIsValid: setIsValid,
      resetFormStatus: resetFormStatus
    };

    return service;

    /////////////////////

    function isFormDirty() {
      return aaSayMessageForm || aaPhoneMenuOptions || aaActionStatus || aaDialByExtensionStatus;
    }

    function isValid() {
      return !_.size(invalidList);
    }

    function setIsValid(element, validity) {
      if (!validity) {
        invalidList[element] = validity;
      } else {
        delete invalidList[element];
      }
    }

    function resetFormStatus() {
      aaSayMessageForm = false;
      aaPhoneMenuOptions = false;
      aaActionStatus = false;
      aaDialByExtensionStatus = false;

      invalidList = {};
    }

    function setSayMessageStatus(status) {
      aaSayMessageForm = status;
    }

    function setPhoneMenuStatus(status) {
      aaPhoneMenuOptions = status;
    }

    function setActionStatus(status) {
      aaActionStatus = status;
    }

    function setDialByExtensionStatus(status) {
      aaDialByExtensionStatus = status;
    }

  }
})();
