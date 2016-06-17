(function () {
  'use strict';
  angular
    .module('Huron')
    .controller('HuronFeatureAADependsCtrl', HuronFeatureAADependsCtrl);

  /* @ngInject */
  function HuronFeatureAADependsCtrl($stateParams) {
    var vm = this;
    vm.featureName = $stateParams.detailsFeatureName;
    vm.dependsNames = $stateParams.detailsDependsList;
  }

})();
