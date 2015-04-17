(function () {
  'use strict';

  /* global alertify */

  angular.module('Core')
    .service('Notification', NotificationFn);

  /* @ngInject */
  function NotificationFn($translate) {
    return {
      notify: notify,
      errorResponse: errorResponse
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
      var errorMsg = '';
      if (errorKey) {
        errorMsg += $translate.instant(errorKey, errorParams);
      }
      if (response && response.data && response.data.errorMessage) {
        errorMsg += ' ' + response.data.errorMessage;
      } else if (response && response.status === 404) {
        errorMsg += ' ' + $translate.instant('errors.status404');
      }
      alertify.log(errorMsg.trim(), 'error', 0);
    }
  }
})();
