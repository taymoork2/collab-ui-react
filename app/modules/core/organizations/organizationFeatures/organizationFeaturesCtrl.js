(function () {
  'use strict';

  angular
    .module('Core')
    .controller('OrganizationFeaturesCtrl', OrganizationFeaturesCtrl);

  /* @ngInject */
  function OrganizationFeaturesCtrl($stateParams, $rootScope, $scope, $state, Storage, Orgservice, Authinfo, Notification) {
    var vm = this;
    vm.currentOrganization = $stateParams.currentOrganization;
    vm.options = [{
      label: 'On',
      value: 1,
      name: 'featureToggle'
    }, {
      label: 'Off',
      value: 0,
      name: 'featureToggle'
    }];
    vm.test = 'test';

    function resetForm() {
      $scope.orgFeatureToggles.form.$setPristine();
      $scope.orgFeatureToggles.form.$setUntouched();
    }

    function updateToggles() {

    }

    vm.resetForm = resetForm;
    vm.updateToggles = updateToggles;
  }
})();
