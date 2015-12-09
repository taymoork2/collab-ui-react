(function () {
  'use strict';

  angular
    .module('Core')
    .controller('OrganizationFeaturesCtrl', OrganizationFeaturesCtrl);

  /* @ngInject */
  function OrganizationFeaturesCtrl($stateParams, $scope, FeatureToggleService, Notification) {
    var vm = this;
    vm.currentOrganization = $stateParams.currentOrganization;
    vm.defaults = [];
    vm.toggles = [];

    vm.resetForm = resetForm;
    vm.updateToggles = updateToggles;

    init();
    ////////////////

    function init() {
      getOrgFeatureToggles();
    }

    function getOrgFeatureToggles() {
      // TODO complete once the feature toggle api is smoothened out
      FeatureToggleService.getFeaturesForOrg(vm.currentOrganization.id)
        .then(function (result) {
          vm.defaults = _.map(result.data.featureToggles, function (value) {
            return {
              toggleId: value.key,
              name: value.key,
              model: value.val,
            };
          });
        })
        .catch(function (err) {
          Notification.error('organizationsPage.errorGettingToggles');
        })
        .finally(vm.resetForm);
    }

    function resetForm() {
      $scope.orgFeatureToggles.form.$setPristine();
      $scope.orgFeatureToggles.form.$setUntouched();
      vm.toggles = angular.copy(vm.defaults);
    }

    function updateToggles() {
      var changedToggles = findDifference();
      var successfulToggles = 0;
      _.map(changedToggles, function (toggle) {
        // The toggle service API only accepts one toggle at a time
        FeatureToggleService.setFeatureToggle(false, vm.currentOrganization.id, toggle.key, toggle.val)
          .catch(function () {
            Notification.error('organizationsPage.errorSettingToggle', {
              key: toggle.key
            });
          })
          .then(function () {
            successfulToggles++;
          });
      });

      if (successfulToggles === changedToggles.length) {
        Notification.success('organizationsPage.toggleModSuccess');
      }
    }

    function findDifference() {
      var keyLessToggles = _.map(angular.copy(vm.toggles), function (value) {
        delete value.key;
        return value;
      });
      return _.filter(keyLessToggles, function (val, ind) {
        if (!_.eq(val, vm.defaults[ind])) {
          return val;
        }
      });
    }
  }
})();
