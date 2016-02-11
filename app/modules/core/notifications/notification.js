(function () {
  'use strict';

  angular.module('Core')
    .config(toastrConfig)
    .service('Notification', NotificationFn);

  /* @ngInject */
  function toastrConfig(toasterConfig) {
    toasterConfig['tap-to-dismiss'] = false;
    toasterConfig['time-out'] = 0;
    toasterConfig['position-class'] = 'toast-bottom-right';
    toasterConfig['close-button'] = true;
    toasterConfig['body-output-type'] = 'trustedHtml';
  }

  /* @ngInject */
  function NotificationFn($translate, $q, toaster, $timeout, AlertService, Localytics) {
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
      if (type === 'error') {
        Localytics.push('Error Message', notifications);
      }
      toaster.pop(type, null, notifications.join('<br/>'), type == 'success' ? 3000 : 0);
    }

    function errorResponse(response, errorKey, errorParams) {
      var errorMsg = processErrorResponse(response, errorKey, errorParams);
      toaster.pop('error', null, errorMsg.trim(), 0);
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

      //TODO
      /* //Update when AngularJS-Toaster 0.4.16 is released
      AlertService.setDeferred(deferred);
      AlertService.setMessage(message);
      toaster.pop({
        type: 'warning',
        body: 'cs-confirmation',
        bodyOutputType: 'directive'
      });
      */

      toaster.pop('warning', null, message + '<br/> <div class="clearfix"><button type="button" class="btn btn--negative ui-ml notification-yes right">' + $translate.instant('common.yes') + '</button>' + '<button type="button" class="btn right notification-no">' + $translate.instant('common.no') + '</button></div>');
      $timeout(function () {
        angular.element('.notification-yes').on('click', function () {
          toaster.clear('*');
          deferred.resolve();
        });

        angular.element('.notification-no').on('click', function () {
          toaster.clear('*');
          deferred.reject();
        });
      }, 0);

      return deferred.promise;
    }
  }
})();
