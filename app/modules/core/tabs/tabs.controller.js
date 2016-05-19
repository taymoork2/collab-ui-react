(function () {
  'use strict';

  angular.module('Core')
    .controller('TabsCtrl', TabsCtrl);

  /* @ngInject */
  function TabsCtrl($rootScope, $scope, $location, Utils, Authinfo, FeatureToggleService) {
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
      updateFeatureTogglesFromTabs(vm.tabs, vm.features);
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

    function updateFeatureTogglesFromTabs(tabs, features) {
      // return s && s.replace(/^!/g, '');
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
        var existing = _.find(features, {
          feature: feature.feature
        });
        if (existing) {
          //noop , keep the enabled flag from previous load.
        } else {
          features.push(feature);
        }
      });
    }

    function getFeatureToggles(features) {
      _.forEach(features, function (feature) {
        FeatureToggleService.supports(feature.feature).then(function (supports) {
          feature.enabled = !!supports;
          updateScopeTabs();
        });
      });
    }
  }
})();
