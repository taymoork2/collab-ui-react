(function () {
  'use strict';

  angular
    .module('Core')
    .controller('OrganizationFeaturesCtrl', OrganizationFeaturesCtrl);

  /* @ngInject */
  function OrganizationFeaturesCtrl($stateParams, $scope, $state, FeatureToggleService, Notification) {
    var vm = this;
    vm.currentOrganization = $stateParams.currentOrganization;
    vm.defaults = [];
    vm.toggles = [];

    vm.resetForm = resetForm;
    vm.updateToggles = updateToggles;

    init();
    ////////////////////////////////////

    function init() {
      getOrgFeatureToggles();
    }

    function getOrgFeatureToggles() {
      // TODO complete once the feature toggle api is smoothened out
      FeatureToggleService.getFeaturesForOrg(vm.currentOrganization.id)
        .then(function (result) {
          vm.defaults = _.chain(result.data.featureToggles)
            .map(function (value) {
              return {
                toggleId: value.key,
                name: value.key,
                model: value.val
              };
            })
            .value();
        })
        .catch(function (err) {
          Notification.error('organizationsPage.errorGettingToggles');
        })
        .finally(function () {
          vm.resetForm();
        });
    }

    function resetForm() {
      $scope.orgFeatureToggles.form.$setPristine();
      $scope.orgFeatureToggles.form.$setUntouched();
      vm.toggles = angular.copy(vm.defaults);
    }

    function updateToggles() {
      var keyLessToggles = _.chain(vm.toggles)
        .map(function (value) {
          delete value.key;
          return value;
        })
        .value();
      var changed = _.filter(keyLessToggles, function (val, ind) {
        if (!_.eq(val, vm.defaults[ind])) {
          return val;
        }
      });
    }
  }
})();
