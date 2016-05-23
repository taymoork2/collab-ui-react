(function () {
  'use strict';

  angular.module('Core')
    .controller('TabsCtrl', TabsCtrl);

  /* @ngInject */
  function TabsCtrl($rootScope, $scope, $location, $q, Utils, Authinfo, FeatureToggleService) {
    var vm = this;
    vm.features = [];
    vm.tabs = [];
    initTabs();

    $scope.$on('AuthinfoUpdated', initTabs);
    $rootScope.$on('TABS_UPDATED', initTabs);
    $rootScope.$on('$stateChangeSuccess', setActiveTab);

    function setActiveTab() {
      resetActiveTabState();

      var tab = _.find($scope.tabs, function (tab) {
        return matchesLocationPath(tab.link) || _.some(tab.subPages, function (subTab) {
          return matchesLocationPath(subTab.link);
        });
      });

      if (tab) {
        tab.isActive = true;
      }
    }

    function matchesLocationPath(path) {
      return Utils.comparePaths(path, $location.path());
    }

    function resetActiveTabState() {
      _.forEach($scope.tabs, function (tab) {
        tab.isActive = false;
      });
    }

    function updateScopeTabs() {
      $scope.tabs = filterFeatureToggledTabs(vm.tabs, vm.features);
      setActiveTab();
    }

    function initTabs() {
      vm.tabs = Authinfo.getTabs();
      vm.features = getUpdatedFeatureTogglesFromTabs(vm.tabs, vm.features);
      getFeatureToggles(vm.features);
      updateScopeTabs();
    }

    function filterFeatureToggledTabs(tabs, features) {
      return _.filter(tabs, function (tab) {
        return !tab.feature || _.some(features, {
          feature: tab.feature.replace(/^!/, ''),
          enabled: !/^!/.test(tab.feature)
        });
      });
    }

    function getUpdatedFeatureTogglesFromTabs(tabs, existingFeatures) {
      //keep the enabled flag from previous load.
      var updatedExistingFeatures = existingFeatures.slice(0);

      var newFeatures = _.chain(tabs)
        .map('feature')
        .compact()
        .invoke(String.prototype.replace, /^!/, '')
        .unique()
        .map(function (feature) {
          return {
            feature: feature,
            enabled: false
          };
        }).value();

      _.forEach(newFeatures, function (feature) {
        var existing = _.find(updatedExistingFeatures, {
          feature: feature.feature
        });
        if (existing) {
          //noop , keep the enabled flag from previous load.
        } else {
          updatedExistingFeatures.push(feature);
        }
      });

      return updatedExistingFeatures;
    }

    function getFeatureToggles(features) {
      var toggles = _.map(features,
        function (feature) {
          return FeatureToggleService.supports(feature.feature).then(
            function (supports) {
              feature.enabled = !!supports;
            });
        });
      $q.all(toggles).then(function () {
        updateScopeTabs();
      });
    }
  }
})();
