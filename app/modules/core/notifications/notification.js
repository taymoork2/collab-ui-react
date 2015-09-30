(function () {
  'use strict';

  /* global alertify */

  angular.module('Core')
    .service('Notification', NotificationFn);

  /* @ngInject */
  function NotificationFn($translate, $q) {
    return {
      success: success,
      error: error,
      notify: notify,
      errorResponse: errorResponse,
      processErrorResponse: processErrorResponse,
      confirmation: confirmation
    };

    function success(messageKey, messageParams) {
      notify($translate.instant(messageKey, messageParams), 'success');
    }

    function error(messageKey, messageParams) {
      notify($translate.instant(messageKey, messageParams), 'error');
    }

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
      alertify.log(notifications.join('<br/>'), type, type == 'success' ? 3000 : 0);
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
      } else if (response && response.data && angular.isString(response.data.error)) {
        errorMsg += ' ' + response.data.error;
      } else if (response && response.status === 404) {
        errorMsg += ' ' + $translate.instant('errors.status404');
      } else if (angular.isString(response)) {
        errorMsg += ' ' + response;
      }

      if (response && angular.isFunction(response.headers)) {
        var trackingId = response.headers('TrackingID');
        if (trackingId) {
          if (errorMsg.length > 0 && !_.endsWith(errorMsg, '.')) {
            errorMsg += '.';
          }
          errorMsg += ' TrackingID: ' + trackingId;
        }
      }
      return _.trim(errorMsg);
    }

    function confirmation(message) {
      var deferred = $q.defer();

      alertify.set({
        labels: {
          ok: $translate.instant('common.yes'),
          cancel: $translate.instant('common.no')
        },
        buttonReverse: true,
      });

      alertify.confirm(message, function (e) {
        if (e) {
          deferred.resolve();
        } else {
          deferred.reject();
        }
      });

      return deferred.promise;
    }
  }
})();
