(function () {
  'use strict';

  /* global alertify */

  angular.module('Core')
    .service('Notification', NotificationFn);

  /* @ngInject */
  function NotificationFn($translate) {
    return {
      notify: notify,
      errorResponse: errorResponse,
      processErrorResponse: processErrorResponse
    };

    function notify(notifications, type) {
      if (!notifications) {
        return;
      }
      if (_.isString(notifications)) {
        notifications = [notifications];
      }
      if (!notifications.length) {
        return;
      }
      type = (type == 'success') ? type : 'error';
      alertify.log(notifications.join('<br/>'), type, 0);
    }

    function errorResponse(response, errorKey, errorParams) {
      var errorMsg = processErrorResponse(response, errorKey, errorParams);
      alertify.log(errorMsg.trim(), 'error', 0);
    }

    function processErrorResponse(response, errorKey, errorParams) {
      var errorMsg = '';
      if (errorKey) {
        errorMsg += $translate.instant(errorKey, errorParams);
      }
      if (response && response.data && angular.isString(response.data.errorMessage)) {
        errorMsg += ' ' + response.data.errorMessage;
      } else if (response && response.status === 404) {
        errorMsg += ' ' + $translate.instant('errors.status404');
      } else if (angular.isString(response)) {
        errorMsg += ' ' + response;
      }

      if (response && angular.isFunction(response.headers)) {
        var trackingId = response.headers('TrackingID');
        if (trackingId) {
          if (!errorMsg.endsWith('.')) {
            errorMsg += '.';
          }
          errorMsg += ' TrackingID: ' + trackingId;
        }
      }
      return errorMsg;
    }
  }
})();
