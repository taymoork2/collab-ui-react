'use strict';

angular.module('Squared')
  .controller('TabsCtrl', ['Config', '$rootScope', '$scope', '$location', 'Log', 'Utils', '$filter', 'Auth', 'Authinfo',
    function(Config, $rootScope, $scope, $location, Log, Utils, $filter, Auth, Authinfo) {

      // keep this empty until all processing is done.
      // Otherwise user will see unlocalized tabs.
      $scope.tabs = [];

      //update the tabs when Authinfo data has been populated.
      $scope.$on('AuthinfoUpdated', function() {
        var roles  = Authinfo.getRoles();
        var allowedTabs = [];
        var tabs = Config.tabs;

        // Collect all allowed tabs from assigned roles
        for(var x = 0; x < roles.length; x++) {
          allowedTabs = allowedTabs.concat(Config.roles[roles[x]]);
        }

        // Remove unauthorized tabs
        for(var idx in Config.tabs) {
          if (allowedTabs.indexOf(Config.tabs[idx]) === -1) {
            tabs.splice(idx, 1);
          }
        }
        $scope.tabs = tabs;
        // TODO extract to a service
        $rootScope.tabs = $scope.tabs;

        //Localize tabs
        for(var index in $scope.tabs) {
          $scope.tabs[index].title = getTabTitle($scope.tabs[index].title);
          if($scope.tabs[index].subPages) {
            for(var i in $scope.tabs[index].subPages) {
              $scope.tabs[index].subPages[i].title = $filter('translate')($scope.tabs[index].subPages[i].title);
              $scope.tabs[index].subPages[i].desc = $filter('translate')($scope.tabs[index].subPages[i].desc);
            }
          }
        }

        Authinfo.setTabs($scope.tabs);
        //Check if this is an allowed tab
        if(!Authinfo.isAllowedTab()){
          $location.path('/login');
        }

        setNavigationTab();
      });

      $rootScope.$on('$routeChangeSuccess', function() {
        setNavigationTab();
      });

      var getTabTitle = function(title) {
        return $filter('translate')(title);
      };

      var setNavigationTab = function() {
        resetActiveTabState();

        for (var idx in $scope.tabs) {
          if ($scope.tabs[idx].subPages) {
            for (var i = 0; i < $scope.tabs[idx].subPages.length; i++) {
              if (Utils.comparePaths($scope.tabs[idx].subPages[i].link, $location.path())) {
                $scope.tabs[idx].isActive = true;
                break;
              }
            }
          } else {
            if (Utils.comparePaths($scope.tabs[idx].link, $location.path())) {
              $scope.tabs[idx].isActive = true;
              break;
            }
          }
        }
      };

      var resetActiveTabState = function() {
        for(var idx in $scope.tabs) {
          $scope.tabs[idx].isActive = false;
        }
      };

    }
  ]);
