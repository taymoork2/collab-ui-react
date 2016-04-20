(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .factory('AANotificationService', AANotificationService);

  function AANotificationService($translate, Notification) {

    var service = {
      error: error
    };

    return service;

    /////////////////////

    // Before calling the core Notification function,
    // tweak data.error sent back from CES.
    function error(response, message, parameters) {
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
    }
  }
})();
