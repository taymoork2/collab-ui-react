(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .factory('AACommonService', AACommonService);

  function AACommonService() {

    var aaSayMessageForm = false;
    var aaPhoneMenuOptions = false;
    var service = {
      isFormDirty: isFormDirty,
      setSayMessageStatus: setSayMessageStatus,
      setPhoneMenuStatus: setPhoneMenuStatus,
      resetFormStatus: resetFormStatus
    };

    return service;

    /////////////////////

    function isFormDirty() {
      return aaSayMessageForm || aaPhoneMenuOptions;
    }

    function resetFormStatus() {
      aaSayMessageForm = false;
      aaPhoneMenuOptions = false;
    }

    function setSayMessageStatus(status) {
      aaSayMessageForm = status;
    }

    function setPhoneMenuStatus(status) {
      aaPhoneMenuOptions = status;
    }

  }
})();
