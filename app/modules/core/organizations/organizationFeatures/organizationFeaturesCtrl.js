(function () {
  'use strict';

  angular
    .module('Core')
    .controller('OrganizationFeaturesCtrl', OrganizationFeaturesCtrl);

  /* @ngInject */
  function OrganizationFeaturesCtrl($stateParams, $scope, $q, FeatureToggleService, Notification) {
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
      var deferred = $q.defer();
      var changedToggles = findDifference();
      var successfulToggles = 0;
      _.map(changedToggles, function (toggle) {
        // The toggle service API only accepts one toggle at a time
        FeatureToggleService.setFeatureToggle(false, vm.currentOrganization.id, toggle.name, toggle.model)
          .catch(function () {
            Notification.error('organizationsPage.errorSettingToggle', {
              key: toggle.key
            });
            deferred.reject();
          })
          .then(function () {
            successfulToggles++;

            _.find(vm.defaults, {
              name: toggle.name
            }).model = toggle.model;

            if (successfulToggles === changedToggles.length) {
              deferred.resolve();
            }
          });
      });

      deferred.promise.then(function () {
        Notification.success('organizationsPage.toggleModSuccess');
      }).finally(function () {
        resetForm();
      });
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
