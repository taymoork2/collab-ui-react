(function () {
  'use strict';

  angular.module('core.notifications')
    .config(toastrConfig)
    .service('Notification', NotificationFn);

  /* @ngInject */
  function toastrConfig(toasterConfig) {
    toasterConfig['tap-to-dismiss'] = false;
    toasterConfig['time-out'] = 0;
    toasterConfig['position-class'] = 'toast-bottom-right';
    toasterConfig['close-button'] = true;
  }

  /* @ngInject */
  function NotificationFn(AlertService, $translate, $q, toaster, $timeout, Config, Log) {
    var NO_TIMEOUT = 0;
    var FAILURE_TIMEOUT = NO_TIMEOUT;
    var SUCCESS_TIMEOUT = Config.isE2E() ? NO_TIMEOUT : 3000;
    var preventToasters = false;

    // TODO: rip out 'stringify()' usage once ATLAS-1338 is resolved
    var _helpers = {
      stringify: stringify
    };

    return {
      success: success,
      warning: warning,
      error: error,
      notify: notify,
      errorResponse: errorResponse,
      errorWithTrackingId: errorWithTrackingId,
      processErrorResponse: processErrorResponse,
      confirmation: confirmation,
      notifyReadOnly: notifyReadOnly,
      _helpers: _helpers
    };

    function success(messageKey, messageParams, titleKey) {
      notify($translate.instant(messageKey, messageParams), 'success', $translate.instant(titleKey));
    }

    function warning(messageKey, messageParams, titleKey) {
      notify($translate.instant(messageKey, messageParams), 'warning', $translate.instant(titleKey));
    }

    function error(messageKey, messageParams, titleKey) {
      notify($translate.instant(messageKey, messageParams), 'error', $translate.instant(titleKey));
    }

    function notifyReadOnly() {
      notify($translate.instant('readOnlyMessages.notAllowed'), 'warning');
      preventToasters = true;
      $timeout(function () {
        preventToasters = false;
      }, 1000);
    }

    function notify(notifications, type, title) {
      if (preventToasters === true) {
        Log.warn('Deliberately prevented a notification:', notifications);
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
        title: title,
        type: type,
        body: 'bind-unsafe-html',
        bodyOutputType: 'directive',
        directiveData: { data: notifications },
        timeout: type == 'success' ? SUCCESS_TIMEOUT : FAILURE_TIMEOUT,
        closeHtml: closeHtml
      });
    }

    function errorWithTrackingId(response, errorKey, errorParams) {
      var errorMsg = getErrorMessage(errorKey, errorParams);
      errorMsg = addTrackingId(errorMsg, response);
      notify(_.trim(errorMsg), 'error');
    }

    function errorResponse(response, errorKey, errorParams) {
      var errorMsg = processErrorResponse(response, errorKey, errorParams);
      notify(_.trim(errorMsg), 'error');
    }

    function processErrorResponse(response, errorKey, errorParams) {
      var errorMsg = getErrorMessage(errorKey, errorParams);
      errorMsg = addResponseMessage(errorMsg, response);
      errorMsg = addTrackingId(errorMsg, response);
      return _.trim(errorMsg);
    }

    function getErrorMessage(key, params) {
      return key ? $translate.instant(key, params) : '';
    }

    // TODO: rip this out once ATLAS-1338 is resolved
    function stringify(jsonifiableVal) {
      return (_.isObjectLike(jsonifiableVal)) ? JSON.stringify(jsonifiableVal) : jsonifiableVal;
    }

    function addResponseMessage(errorMsg, response) {
      if (_.get(response, 'data.errorMessage')) {
        // TODO: rip out 'stringify()' usage once ATLAS-1338 is resolved
        errorMsg += ' ' + stringify(response.data.errorMessage);
      } else if (_.get(response, 'data.error')) {
        // TODO: rip out 'stringify()' usage once ATLAS-1338 is resolved
        errorMsg += ' ' + stringify(response.data.error);
      } else if (_.get(response, 'status') === 404) {
        errorMsg += ' ' + $translate.instant('errors.status404');
      } else if (_.isString(response)) {
        errorMsg += ' ' + response;
      }
      return errorMsg;
    }

    function addTrackingId(errorMsg, response) {
      // use value from 'TrackingID' header if available
      var trackingId = _.isFunction(_.get(response, 'headers')) && response.headers('TrackingID');

      // fallback if no value available
      if (!trackingId) {
        trackingId = _.get(response, 'data.trackingId');
      }

      if (trackingId) {
        if (errorMsg.length > 0 && !_.endsWith(errorMsg, '.')) {
          errorMsg += '.';
        }
        errorMsg += ' TrackingID: ' + trackingId;
      }
      return errorMsg;
    }

    function confirmation(message) {
      var deferred = $q.defer();

      AlertService.setDeferred(deferred);
      AlertService.setMessage(message);
      toaster.pop({
        type: 'warning',
        body: 'cs-confirmation',
        bodyOutputType: 'directive',
        showCloseButton: false
      });

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
