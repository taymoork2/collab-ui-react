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
    vm.handleClick = handleClick;
    vm.unalteredToggles = [];

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
              name: obj.name,
            })[0];
          });

          vm.defaults = dbFeatures.concat(stdFeatures);
          vm.unalteredToggles = dbFeatures.concat(stdFeatures);
        })
        .catch(function (response) {
          Notification.errorResponse(response, 'organizationsPage.errorGettingToggles');
        })
        .finally(resetForm);
    }

    function resetForm() {
      vm.toggles = angular.copy(vm.defaults);
    }

    function updateToggles(toggle) {
      var featureToggleRules = FeatureToggleService.generateFeatureToggleRule(vm.currentOrganization.id, toggle.name, toggle.model);

      FeatureToggleService.setFeatureToggles(false, featureToggleRules)
        .then(function () {
          var toggle = _.find(vm.defaults, {
            name: featureToggleRules.key,
          });
          if (_.has(toggle, 'model')) {
            toggle.model = featureToggleRules.val;
          }
          Notification.success('organizationsPage.toggleModSuccess', {
            featureToggleName: featureToggleRules.key,
            orgId: featureToggleRules.orgId,
            toggleState: featureToggleRules.val,
          });
        })
        .catch(function (response) {
          Notification.errorResponse(response, 'organizationsPage.errorSettingToggle');
        })
        .finally(resetForm);
    }

    function handleClick(toggle) {
      var clickedToggle = _.find(vm.unalteredToggles, {
        name: toggle.name,
      });
      // Logic to capture one click with the right model value
      if (_.has(clickedToggle, 'model')) {
        if (clickedToggle.model !== toggle.model) {
          updateToggles(toggle);
        }
      }
    }
  }
})();
