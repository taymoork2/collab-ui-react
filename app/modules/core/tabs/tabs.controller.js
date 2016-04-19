(function () {
  'use strict';

  angular.module('Core')
    .controller('TabsCtrl', TabsCtrl);

  /* @ngInject */
  function TabsCtrl($rootScope, $scope, $location, Utils, Authinfo, FeatureToggleService) {
    var tc = this;
    tc.features = [];
    tc.tabs = [];
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
      $scope.tabs = filterFeatureToggledTabs(tc.tabs, tc.features);
      setActiveTab();
    }

    function filterFeatureToggledTabs(tabs, features) {
      return _.filter(tabs, function (tab) {
        return !tab.feature || _.any(features, {
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
          return {feature: feature, enabled: false};
        }).value();
      console.log('fadfa',newFeatures,tabs);

    _.forEach(newFeatures,function (feature) {
        var existing = _.find(features, {feature: feature.feature});
        if (existing) {
          console.log('nooop');
          //noop , keep the enabled flag from previous load.
        } else {
          console.log('push', feature, features);
          features.push(feature);
        }
      });
      console.log('ff2', features);
    }

    function getFeatureToggles(features) {
      _.forEach(features, function (feature) {
        FeatureToggleService.supports(feature.feature).then(function (supports) {
          console.log('featur toggle support',supports, feature);
          feature.enabled = !!supports;
          updateScopeTabs();
        });
      });
    }


    function initTabs() {
      tc.tabs = Authinfo.getTabs();
      console.log(tc, tc.tabs);
      updateFeatureTogglesFromTabs(tc.tabs, tc.features);
      getFeatureToggles(tc.features);
      console.log('after get toglles',tc, tc.features);
      updateScopeTabs();
      // $scope.tabs = filterFeatureToggledTabs(tabs, tc.features);
      // console.log('features', features, filterFeatureToggledTabs(tabs, features));
      // _.forEach($scope.tabs, function (tab) {console.log(tab);});
      // setActiveTab();
    }
  }
})();
