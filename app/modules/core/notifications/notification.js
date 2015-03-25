(function () {
  'use strict';

  /* global alertify */

  angular.module('Core')
    .service('Notification', Notification);

  /* @ngInject */
  function Notification() {
    return {
      notify: function (notifications, type) {
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
    };
  }
})();
