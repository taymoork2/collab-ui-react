(function () {
  'use strict';

  angular
    .module('Core')
    .controller('OrganizationFeaturesCtrl', OrganizationFeaturesCtrl);

  /* @ngInject */
  function OrganizationFeaturesCtrl($stateParams, FeatureToggleService, Notification) {
    var vm = this;
    vm.currentOrganization = $stateParams.currentOrganization;
    vm.defaults = [];
    vm.toggles = [];

    vm.resetForm = resetForm;
    vm.updateToggles = updateToggles;
    vm.handleClick = handleClick;

    init();
    ////////////////

    function init() {
      getOrgFeatureToggles();
    }

    function getOrgFeatureToggles() {
      function convertToTogglable(value) {
        return {
          toggleId: value.key || value,
          name: value.key || value,
          model: value.val || false,
        };
      }

      FeatureToggleService.getFeaturesForOrg(vm.currentOrganization.id, true)
        .then(function (result) {
          var stdFeatures = _.map(FeatureToggleService.features, convertToTogglable);
          var dbFeatures = _.map(result.featureToggles, convertToTogglable);

          _.remove(stdFeatures, function (obj) {
            return _.filter(dbFeatures, {
              name: obj.name
            })[0];
          });

          vm.defaults = dbFeatures.concat(stdFeatures);
        })
        .catch(function () {
          Notification.error('organizationsPage.errorGettingToggles');
        })
        .finally(vm.resetForm);
    }

    function resetForm() {
      vm.toggles = angular.copy(vm.defaults);
    }

    function updateToggles() {
      var changedToggles = findDifference();

      var featureToggleRules = _.map(changedToggles, function (toggle) {
        return FeatureToggleService.generateFeatureToggleRule(vm.currentOrganization.id, toggle.name, toggle.model);
      });

      if (featureToggleRules.length) {
        FeatureToggleService.setFeatureToggles(false, featureToggleRules)
          .catch(function () {
            Notification.error('organizationsPage.errorSettingToggle');
          })
          .then(function () {
            _.forEach(featureToggleRules, function (ftr) {
              _.find(vm.defaults, {
                name: ftr.key
              }).model = ftr.val;
            });
            Notification.success('organizationsPage.toggleModSuccess');
          })
          .finally(resetForm);
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

    function handleClick() {
      updateToggles();
    }
  }
})();
