(function () {
  'use strict';

  angular.module('Core')
    .controller('BodyCtrl', BodyCtrl);

  /* @ngInject */
  function BodyCtrl($scope) {
    var vm = this;
    vm.partner = false;

    $scope.$on('InvertNavigation', function () {
      vm.partner = true;
    });
  }
})();
