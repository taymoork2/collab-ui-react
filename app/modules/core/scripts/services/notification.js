'use strict';
/* global alertify, $, draggable */

angular.module('Core')
  .service('Notification', ['$dialogs', '$compile', 'Log',
    function Notification($dialogs, $compile) {
      // AngularJS will instantiate a singleton by calling "new" on this function
      var _successes = [];
      var _errors = [];
      var _scope = null;
      var success_id = 0;
      var error_id = 0;
      return {
        init: function(scope) {
          _scope = scope;
        },
        notify: function(notifications, type) { //notifications must be an array. Type is 'success' or 'error'
          var icon = null;
          if (type === 'success') {
            icon = '<i class="fa fa-check"></i>';
            _successes[success_id] = notifications;
          } else {
            icon = '<i class="fa fa-exclamation-triangle"></i>';
            _errors[error_id] = notifications;
          }

          if (notifications.length > 0 && notifications.length === 1) {
            if (type === 'success') {
              alertify.log(icon + ' 1 ' + type + '<i id="small-notification-cancel" class="fa fa-times pull-right log-success-id-' + success_id + '"></i>', type, 0);
              $compile(angular.element('.alertify-log-' + type).last().attr('ng-click', 'popup(\'' + type + '\',' + success_id + ')'))(_scope);
              $('.fa-times.log-success-id-' + success_id).click(function() {
                $(this).parent().off('click');
              });
              success_id++;
            } else {
              alertify.log(icon + ' 1 ' + type + '<i id="small-notification-cancel" class="fa fa-times pull-right log-error-id-' + error_id + '"></i>', type, 0);
              $compile(angular.element('.alertify-log-' + type).last().attr('ng-click', 'popup(\'' + type + '\',' + error_id + ')'))(_scope);
              $('.fa-times.log-error-id-' + error_id).click(function() {
                $(this).parent().off('click');
              });
              error_id++;
            }

          } else if (notifications.length > 0) {
            if (type === 'success') {
              alertify.log(icon + ' ' + notifications.length + ' ' + 'successes <i id="small-notification-cancel" class="fa fa-times pull-right log-success-id-' + success_id + '"></i>', type, 0);
              $compile(angular.element('.alertify-log-' + type).last().attr('ng-click', 'popup(\'' + type + '\',' + success_id + ')'))(_scope);
              $('.fa-times.log-success-id-' + success_id).click(function() {
                $(this).parent().off('click');
              });
              success_id++;
            } else {
              alertify.log(icon + ' ' + notifications.length + ' ' + 'errors <i id="small-notification-cancel" class="fa fa-times pull-right log-error-id-' + error_id + '"></i>', type, 0);
              $compile(angular.element('.alertify-log-' + type).last().attr('ng-click', 'popup(\'' + type + '\',' + error_id + ')'))(_scope);
              $('.fa-times.log-error-id-' + error_id).click(function() {
                $(this).parent().off('click');
              });
              error_id++;
            }
          }
        },
        popup: function(type, id) {
          var output = '';
          var popup = '';
          var i = 0;
          if (type === 'error') {
            for (i in _errors[id]) {
              output += '<p>' + _errors[id][i] + '</p>';
            }
            popup = '<div class="panel panel-danger notification-panel">' + '<div class="panel-heading panel-notification-heading"><h3 class="panel-title" style="font-size:14px;"><i class="fa fa-exclamation-triangle"></i> Error notifications <i id="notifications-cancel" class="fa fa-times pull-right error-id-' + id + '"></i></h3></div>' + '<div class="panel-body panel-danger-body">' + output + '</div></div>';
            $compile(angular.element('.notification').after(popup))(_scope);
            $('.notification-panel').animate({
              'right': '30px'
            }, 'normal');
            $('.fa-times.error-id-' + id).click(function() {
              $(this).parents().eq(2).fadeOut('normal', function() {
                $(this).remove();
              });
            });
            //draggable($('.notification-panel').get(0), $('.panel-notification-heading').get(0));
          } else {
            for (i in _successes[id]) {
              output += '<p>' + _successes[id][i] + '</p>';
            }
            popup = '<div class="panel panel-success notification-panel">' + '<div class="panel-heading panel-notification-heading"><h3 class="panel-title" style="font-size:14px;"><i class="fa fa-check"></i> Success notifications <i id="notifications-cancel" class="fa fa-times pull-right success-id-' + id + '"></i><a/></h3></div>' + '<div class="panel-body panel-success-body">' + output + '</div></div>';
            $compile(angular.element('.notification').after(popup))(_scope);
            $('.notification-panel').animate({
              'right': '30px'
            }, 'normal');
            $('.fa-times.success-id-' + id).click(function() {
              $(this).parents().eq(2).fadeOut('normal', function() {
                $(this).remove();
              });
            });
            //draggable($('.notification-panel').get(0), $('.panel-notification-heading').get(0));
          }
        }
      };
    }
  ]);
