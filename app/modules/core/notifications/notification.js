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
  function NotificationFn($translate, $q, toaster, $timeout, AlertService, Config, Authinfo) {
    var NO_TIMEOUT = 0;
    var FAILURE_TIMEOUT = NO_TIMEOUT;
    var SUCCESS_TIMEOUT = Config.isE2E() ? NO_TIMEOUT : 3000;

    return {
      success: success,
      warning: warning,
      error: error,
      notify: notify,
      errorResponse: errorResponse,
      processErrorResponse: processErrorResponse,
      confirmation: confirmation,
      notifyReadOnly: notifyReadOnly
    };

    function success(messageKey, messageParams) {
      notify($translate.instant(messageKey, messageParams), 'success');
    }

    function warning(messageKey, messageParams) {
      notify($translate.instant(messageKey, messageParams), 'warning');
    }

    function error(messageKey, messageParams) {
      notify($translate.instant(messageKey, messageParams), 'error');
    }

    function notifyReadOnly(rejection) {
      notify('Not allowed in read-only mode. Operation not executed.', 'warning', true);
    }

    function notify(notifications, type, readOnly) {
      if (_.isFunction(Authinfo.isReadOnlyAdmin) && Authinfo.isReadOnlyAdmin() && !readOnly) {
        return;
      }
      var types = ['success', 'warning', 'error'];
      var closeHtml = '<button type="button" class="close toast-close-button"><span class="sr-only">' + $translate.instant('common.close') +
        '</span></button>';

      if (!notifications) {
        return;
      }
      if (_.isString(notifications)) {
        notifications = [notifications];
      }
      if (!notifications.length) {
        return;
      }
      type = _.includes(types, type) ? type : 'error';
      toaster.pop({
        type: type,
        body: notifications.join('<br/>'),
        timeout: type == 'success' ? SUCCESS_TIMEOUT : FAILURE_TIMEOUT,
        closeHtml: closeHtml
      });
    }

    function errorResponse(response, errorKey, errorParams) {
      var errorMsg = processErrorResponse(response, errorKey, errorParams);
      notify(errorMsg.trim(), 'error');
    }

    function processErrorResponse(response, errorKey, errorParams) {
      var errorMsg = '';
      if (errorKey) {
        errorMsg += $translate.instant(errorKey, errorParams);
      }
      if (_.get(response, 'data.errorMessage')) {
        errorMsg += ' ' + response.data.errorMessage;
      } else if (_.get(response, 'data.error')) {
        errorMsg += ' ' + response.data.error;
      } else if (_.get(response, 'status') === 404) {
        errorMsg += ' ' + $translate.instant('errors.status404');
      } else if (_.isString(response)) {
        errorMsg += ' ' + response;
      }

      if (_.isFunction(_.get(response, 'headers'))) {
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

      toaster.pop('warning', null, message +
        '<br/> <div class="clearfix"><button type="button" class="btn btn--negative ui-ml notification-yes right">' + $translate.instant(
          'common.yes') + '</button>' + '<button type="button" class="btn right notification-no">' + $translate.instant('common.no') +
        '</button></div>');
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
