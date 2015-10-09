//(function () {
//  'use strict';
//  angular
//    .module('uc.hurondetails')
//    .controller('FeaturesCtrl', FeaturesCtrl);
//
//  /* @ngInject */
//  function FeaturesCtrl($modal, Notification, FeaturesService) {
//
//    var vm = this;
//    vm.featuresAvailable = featuresAvailable;
//    vm.newFeature = openModal;
//    vm.feature = '';
//    vm.featureList = [];
//
//    ////////////
//
//    FeaturesService.listFeatures().then(function handleFeatures(list) {
//      vm.featureList = list;
//    }).catch(function (response) {
//      vm.featureList = [];
//      Notification.errorResponse(response, 'huronDetails.featureListingError');
//    });
//
//    function featuresAvailable() {
//      return vm.featureList.length > 0;
//    }
//
//    function openModal() {
//      var modalInstance = $modal.open({
//        templateUrl: 'modules/huron/features/newFeature/newFeatureModal.tpl.html',
//        controller: 'NewFeatureModalCtrl',
//        controllerAs: 'newFeatureModalCtrl',
//        size: 'lg'
//      });
//      modalInstance.result.then(function (selectedFeature) {
//        vm.feature = selectedFeature;
//      }, function () {
//        vm.feature = '';
//      });
//    }
//  }
//})();
