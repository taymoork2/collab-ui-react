(function () {
  'use strict';
  angular
    .module('uc.hurondetails')
    .controller('ListFeaturesCtrl', ListFeaturesCtrl);

  /* @ngInject */
  function ListFeaturesCtrl($scope, $state, ListFeaturesService) {

    var featureList = [];
    ListFeaturesService.listFeatures().then(function handleFeatures(list) {
      if (list.length === 0)
        $state.go("huronnewfeature");
      else
        featureList = list;
    });
  }
})();
