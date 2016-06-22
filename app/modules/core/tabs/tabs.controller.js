(function () {
  'use strict';

  angular.module('Core')
    .controller('TabsCtrl', TabsCtrl);

  /* @ngInject */
  function TabsCtrl($rootScope, $scope, $translate, $location, $q, Utils, Authinfo, Config, FeatureToggleService, tabConfig) {
    var vm = this;
    vm.features = [];
    vm.tabs = [];
    initTabs();

    $scope.$on('AuthinfoUpdated', initTabs);
    $rootScope.$on('TABS_UPDATED', initTabs);
    $rootScope.$on('$stateChangeSuccess', setActiveTab);

    function setActiveTab() {
      resetActiveTabState();
      var tab = _.find(vm.tabs, function (tab) {
        return matchesLocationPath(tab.link) || _.some(tab.subPages, function (subTab) {
          return matchesLocationPath(subTab.link);
        });
      });

      if (tab) {
        tab.isActive = true;
      }
    }

    vm.showLeftNav = function showLeftNav() {
      return Utils.isAdminPage();
    };

    function matchesLocationPath(path) {
      return Utils.comparePaths(path, $location.path());
    }

    function resetActiveTabState() {
      _.forEach(vm.tabs, function (tab) {
        tab.isActive = false;
      });
    }

    function filterTabsOnFeaturesAndSetActiveTab() {
      vm.tabs = filterFeatureToggledTabs(vm.unfilteredTabs, vm.features);
      setActiveTab();
    }

    function initTabs() {
      vm.unfilteredTabs = initializeTabs();
      vm.features = getUpdatedFeatureTogglesFromTabs(vm.unfilteredTabs, vm.features);
      getFeatureToggles(vm.features);
      filterTabsOnFeaturesAndSetActiveTab();
    }

    function initializeTabs() {
      var tabs = angular.copy(tabConfig);
      return _.chain(tabs)
        .filter(function (tab) {
          // Remove subPages whose parent tab is hideProd or states that aren't allowed
          _.remove(tab.subPages, function (subTab) {
            return isHideProdTab(tab) || !isAllowedTab(subTab);
          });
          // Filter allowed states or tabs with subPages
          return isAllowedTab(tab) || _.size(tab.subPages);
        })
        .forEach(function (tab) {
          tab.title = $translate.instant(tab.title);
          _.forEach(tab.subPages, function (subTab) {
            subTab.title = $translate.instant(subTab.title);
            subTab.desc = $translate.instant(subTab.desc);
          });
        })
        .value();
    }

    function isAllowedTab(tab) {
      return Authinfo.isAllowedState(tab.state) && !isHideProdTab(tab);
    }

    function isHideProdTab(tab) {
      return tab.hideProd && Config.isProd();
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
      return _.chain(tabs)
        .map('feature')
        .compact()
        .invoke(String.prototype.replace, /^!/, '')
        .unique()
        .map(function (feature) {
          return {
            feature: feature,
            enabled: _.some(existingFeatures, {
              feature: feature.feature,
              enabled: true
            })
          };
        }).value();
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
        filterTabsOnFeaturesAndSetActiveTab();
      });
    }
  }
})();
