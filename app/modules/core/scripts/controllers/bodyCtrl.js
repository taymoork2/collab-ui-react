(function () {
  'use strict';

  angular.module('Core')
    .controller('BodyCtrl', BodyCtrl);

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
