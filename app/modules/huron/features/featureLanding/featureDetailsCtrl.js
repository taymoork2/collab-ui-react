(function () {
  'use strict';
  /* jshint validthis: true */
  angular
    .module('Huron')
    .controller('HuronFeatureDetailsCtrl', HuronFeatureDetailsCtrl);

  /* @ngInject */
  function HuronFeatureDetailsCtrl($rootScope, $scope, $stateParams, $timeout, $translate, AAModelService, HuntGroupService, AutoAttendantCeService, AutoAttendantCeInfoModelService, Notification, Log) {
    var vm = this;
    vm.featureId = $stateParams.detailsFeatureId;
    vm.featureName = $stateParams.detailsFeatureName;
    vm.featureFilter = $stateParams.detailsFeatureType;
    vm.dependslist = $stateParams.detailsDepends;
    vm.depends = "depends go here";
    vm.dlist = ['AA1', 'AA2', 'AA3'];
    vm.kjhlist = $stateParams.detailsDependsList;
    vm.featureType = vm.featureFilter === 'AA' ? $translate.instant('autoAttendant.title') : vm.featureFilter === 'HG' ?
      $translate.instant('huronHuntGroup.title') : 'Feature';

  }

})();
