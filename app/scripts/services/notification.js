'use strict';
/* global alertify, $, draggable */

angular.module('wx2AdminWebClientApp')
  .service('Notification', ['$dialogs', '$compile', 'Log',
    function Notification($dialogs, $compile) {
      // AngularJS will instantiate a singleton by calling "new" on this function
      var _successes = null;
      var _errors = null;
      var _scope = null;
      return {
        init: function(scope) {
          _scope = scope;
        },
        notify: function(notifications, type) { //notifications must be an array.
          var icon = null;
          if (type === 'success') {
            icon = '<i class="fa fa-check"></i>';
            _successes = notifications;
          } else {
            icon = '<i class="fa fa-exclamation-triangle"></i>';
            _errors = notifications;
          }

          if (notifications.length > 0 && notifications.length === 1) {
            alertify.log(icon + ' 1 ' + type, type, 0);
            $compile(angular.element('.alertify-log-' + type).attr('ng-click', 'popup(\'' + type + '\')'))(_scope);
          } else if (notifications.length > 0) {
            if (type === 'success') {
              alertify.log(icon + ' ' + notifications.length + ' ' + 'successes', type, 0);
              $compile(angular.element('.alertify-log-' + type).attr('ng-click', 'popup(\'' + type + '\')'))(_scope);
            } else {
              alertify.log(icon + ' ' + notifications.length + ' ' + 'errors', type, 0);
              $compile(angular.element('.alertify-log-' + type).attr('ng-click', 'popup(\'' + type + '\')'))(_scope);
            }
          }
        },
        popup: function(type) {
          var output = '';
          var popup = '';
          var i = 0;
          if (type === 'error') {
            for (i in _errors) {
              output += '<p>' + _errors[i] + '</p>';
            }
            popup = '<div class="panel panel-danger notification-panel">' + '<div class="panel-heading panel-notification-heading"><h3 class="panel-title" style="font-size:14px;"><i class="fa fa-exclamation-triangle"></i> Error notifications <i class="fa fa-times pull-right"></i></h3></div>' + '<div class="panel-body panel-danger-body">' + output + '</div></div>';
            $compile(angular.element('.notification').after(popup))(_scope);
            $('.notification-panel').animate({
              'right': '30px'
            }, 'normal');
            $('.fa-times').click(function(){
              $('.panel-danger.notification-panel').fadeOut();
            });
            draggable($('.notification-panel').get(0), $('.panel-notification-heading').get(0));
          } else {
            for (i in _successes) {
              output += '<p>' + _successes[i] + '</p>';
            }
            popup = '<div class="panel panel-success notification-panel">' + '<div class="panel-heading panel-notification-heading"><h3 class="panel-title" style="font-size:14px;"><i class="fa fa-check"></i> Success notifications <i class="fa fa-times pull-right"></i><a/></h3></div>' + '<div class="panel-body panel-success-body">' + output + '</div></div>';
            $compile(angular.element('.notification').after(popup))(_scope);
            $('.notification-panel').animate({
              'right': '30px'
            }, 'normal');
            $('.fa-times').click(function(){
              $('.panel-success.notification-panel').fadeOut();
            });
            draggable($('.notification-panel').get(0), $('.panel-notification-heading').get(0));
          }

        }
      };
    }
  ]);
