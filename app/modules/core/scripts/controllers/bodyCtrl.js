(function () {
  'use strict';

  module.exports = angular.module('core.body', [
    require('modules/core/scripts/services/authinfo')
  ])
    .controller('BodyCtrl', BodyCtrl)
    .name;

  /* @ngInject */
  function BodyCtrl($scope, $rootScope, Authinfo) {
    var vm = this;
    vm.partner = false;
    vm.bodyClass = $rootScope.bodyClass;
    $scope.$on('AuthinfoUpdated', function () {
      vm.partner = Authinfo.isPartner();
    });
  }
})();
