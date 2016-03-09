(function () {
  'use strict';

  angular.module('Core')
    .controller('TabsCtrl', TabsCtrl);

  /* @ngInject */
  function TabsCtrl($rootScope, $scope, $location, Utils, Authinfo) {

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

    function initTabs() {
      $scope.tabs = Authinfo.getTabs();
      setActiveTab();
    }
  }
})();
