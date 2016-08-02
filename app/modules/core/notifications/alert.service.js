(function () {
  'use strict';

  angular.module('core.notifications')
    .service('AlertService', AlertServiceFn);

  /* @ngInject */
  function AlertServiceFn() {
    var alertDefer,
      alertMessage;
    return {
      setDeferred: setDeferred,
      getDeferred: getDeferred,
      setMessage: setMessage,
      getMessage: getMessage
    };

    function setDeferred(deferred) {
      alertDefer = deferred;
    }

    function getDeferred() {
      return alertDefer;
    }

    function setMessage(message) {
      alertMessage = message;
    }

    function getMessage() {
      return alertMessage;
    }
  }
})();
