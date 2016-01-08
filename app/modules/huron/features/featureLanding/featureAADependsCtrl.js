(function () {
  'use strict';
  angular
    .module('Huron')
    .controller('HuronFeatureAADependsCtrl', HuronFeatureAADependsCtrl);

  /* @ngInject */
  function HuronFeatureAADependsCtrl($rootScope, $scope, $stateParams) {
    var vm = this;
    vm.featureName = $stateParams.detailsFeatureName;
    vm.dependsNames = $stateParams.detailsDependsList;
  }

})();
