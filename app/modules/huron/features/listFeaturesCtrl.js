(function () {
  'use strict';
  angular
    .module('uc.hurondetails')
    .controller('ListFeaturesCtrl', ListFeaturesCtrl);

  /* @ngInject */
  function ListFeaturesCtrl($scope, $state, Notification, ListFeaturesService) {

    var vm = $scope;
    vm.featureList = [];

    ListFeaturesService.listFeatures().then(function handleFeatures(list) {
      if (list.length === 0)
        $state.go("huronnewfeature");
      else
        vm.featureList = list;
    }).catch(function (response) {
      vm.featureList = [];
      Notification.errorResponse(response, 'huronDetails.featureListingError');
    });
  }
})();
