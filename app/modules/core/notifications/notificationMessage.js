(function () {
  'use strict';

  angular.module('Core')
    .factory('notificationMessage', notificationMessage);

  /* @ngInject */
  function notificationMessage($rootScope) {
    var factory = {
      success: success,
      error: error
    };

    return factory;

    function error(msg) {
      $rootScope.$emit('notification-new', {
        type: 'danger',
        msg: msg
      });
    }

    function success(msg) {
      $rootScope.$emit('notification-new', {
        type: 'success',
        msg: msg
      });
    }
  }
})();
