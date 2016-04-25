(function () {
  'use strict';

  angular.module('Core')
    .controller('BodyCtrl', BodyCtrl);

  /* @ngInject */
  function BodyCtrl($scope, $rootScope, $state, Authinfo) {
    var vm = this;
    vm.partner = false;
    // vm.bodyClass = function() {
    //   var state = $state.current;
    //   var stateData = state.data;
    //   var stateName = state.name;
    //   if (stateData.bodyClass) {
    //     return stateData.bodyClass;
    //   } else {
    //     return stateName.replace(/\./g, '-');
    //   }
    // };
    vm.bodyClass = $rootScope.bodyClass;
    $scope.$on('AuthinfoUpdated', function () {
      vm.partner = Authinfo.isPartner();
    });
  }
})();
