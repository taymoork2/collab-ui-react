(function () {
  'use strict';

  angular
    .module('Core')
    .controller('OrganizationFeaturesCtrl', OrganizationFeaturesCtrl);

  /* @ngInject */
  function OrganizationFeaturesCtrl($stateParams, $scope, $state, FeatureToggleService) {
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

    function getOrgFeatureToggles() {
      // TODO complete once the feature toggle api is smoothened out
      FeatureToggleService.getFeaturesForOrg(vm.currentOrganization.id)
        .then(function (result) {

        })
        .catch(function (err) {

        });
    }

    vm.resetForm = resetForm;
    vm.updateToggles = updateToggles;
    getOrgFeatureToggles();
  }
})();
