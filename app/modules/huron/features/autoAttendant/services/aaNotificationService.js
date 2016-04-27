(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .factory('AANotificationService', AANotificationService);

  /* @ngInject */
  function AANotificationService($translate, Notification) {

    var service = {
      success: success,
      error: error,
      errorResponse: errorResponse
    };

    return service;

    /////////////////////

    function success(message, parameters) {
      Notification.success(message, parameters);
    }

    function error(message, parameters) {
      Notification.error(message, parameters);
    }

    function errorResponse(response, message, parameters) {
      //If response has data.error, most likely from CES.
      //Parse response data.error part differently and call Notification.notify.
      //Else, if response has data.errorMessage, most likly from CMI.
      //Just call Notification.errorResponse then.
      if (_.get(response, 'data.error')) {
        var cesErrorMsg = '';
        var i = 0;

        cesErrorMsg += $translate.instant(message, parameters);
        if (_.get(response, 'data.error.key')) {
          cesErrorMsg += ' Key: ' + response.data.error.key;
        }
        if (_.get(response, 'data.error.message')) {
          cesErrorMsg += ' Description:';
          for (i = 0; i < response.data.error.message.length; i++) {
            cesErrorMsg += ' ' + response.data.error.message[i].description;
          }
        }
        if (_.get(response, 'data.error.trackingId')) {
          cesErrorMsg += ' TrackingId: ' + response.data.error.trackingId;
        }
        Notification.notify(cesErrorMsg, 'error');
      } else if (_.get(response, 'data.errorMessage')) {
        Notification.errorResponse(response, message, parameters);
      }
    }
  }
})();
