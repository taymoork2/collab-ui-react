(function () {
  'use strict';

  angular.module('Core')
    .controller('NotificationsCtrl', NotificationsCtrl);

  /* @ngInject */
  function NotificationsCtrl($rootScope) {
    var vm = this;

    vm.notifications = [];

    $rootScope.$on('notification-new', create);

    function create(event, notification) {
      vm.notifications.push(notification);
    }

    function close(index) {
      if (index > -1) {
        vm.notifications.splice(index, 1);
      }
    }

    vm.close = close;
  }
})();
