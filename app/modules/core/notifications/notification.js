(function () {
  'use strict';
  /* global alertify */

  angular.module('Core')
    .service('Notification', Notification);

  /* @ngInject */
  function Notification($compile, $rootScope, $translate, notificationMessage) {
    var _successes = [];
    var _errors = [];
    var _scope = $rootScope;
    var success_id = 0;
    var error_id = 0;

    var service = {
      notify: notify,
      popup: popup
    };

    function notify(notifications, type) { //notifications must be an array. Type is 'success' or 'error'
      if (!_scope.popup) {
        _scope.popup = service.popup;
      }
      var icon = null;
      if (type === 'success') {
        icon = '<i class="icon icon-check"></i>';
        _successes[success_id] = notifications;
      } else {
        icon = '<i class="icon icon-error"></i>';
        _errors[error_id] = notifications;
      }

      if (notifications.length > 0) {
        if (type === 'success') {
          var successTotal = $translate.instant('notifications.successTotal', {
            total: notifications.length
          }, 'messageformat');
          alertify.log(icon + ' ' + successTotal + ' <i id="small-notification-cancel" class="icon icon-close pull-right log-success-id-' + success_id + '"></i>', type, 0);
          $compile(angular.element('.alertify-log-' + type).last().attr('ng-click', 'popup(\'' + type + '\',' + success_id + ')'))(_scope);
          $('.icon-close.log-success-id-' + success_id).click(function () {
            $(this).parent().off('click');
          });
          success_id++;
        } else {
          var errorTotal = $translate.instant('notifications.errorTotal', {
            total: notifications.length
          }, 'messageformat');
          alertify.log(icon + ' ' + errorTotal + ' <i id="small-notification-cancel" class="icon icon-close pull-right log-error-id-' + error_id + '"></i>', type, 0);
          $compile(angular.element('.alertify-log-' + type).last().attr('ng-click', 'popup(\'' + type + '\',' + error_id + ')'))(_scope);
          $('.icon-close.log-error-id-' + error_id).click(function () {
            $(this).parent().off('click');
          });
          error_id++;
        }
      }
    }

    function popup(type, id) {
      var output = '';
      var i = 0;
      if (type === 'error') {
        for (i in _errors[id]) {
          output += '<p>' + _errors[id][i] + '</p>';
        }
        notificationMessage.error(output);
      } else {
        for (i in _successes[id]) {
          output += '<p>' + _successes[id][i] + '</p>';
        }
        notificationMessage.success(output);
      }
    }

    return service;
  }

})();
