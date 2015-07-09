'use strict';

angular.module('Core')
  .controller('BodyCtrl', function ($scope) {
    var vm = this;
    vm.partner = false;

    $scope.$on('InvertNavigation', function () {
      vm.partner = true;
    });
  });
