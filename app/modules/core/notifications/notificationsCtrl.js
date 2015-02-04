(function () {
  'use strict';

  angular.module('Core')
    .controller('NotificationsCtrl', NotificationsCtrl);

  /* @ngInject */
  function NotificationsCtrl($rootScope) {
    var vm = this;

    vm.notifications = [];
    vm.close = close;

    $rootScope.$on('notification-new', create);

    function create(event, notification) {
      vm.notifications.push(notification);
    }

    function close(index) {
      if (index > -1) {
        vm.notifications.splice(index, 1);
      }
    }
  }
})();
