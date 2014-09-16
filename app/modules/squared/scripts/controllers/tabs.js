'use strict';

angular.module('Squared')
  .controller('TabsCtrl', ['Config', '$rootScope', '$scope', '$location', 'Log', 'Utils', '$filter', 'Auth', 'Authinfo',
    function(Config, $rootScope, $scope, $location, Log, Utils, $filter, Auth, Authinfo) {

      $scope.tabs = [];

      //update the tabs when Authinfo data has been populated.
      $scope.$on('AuthinfoUpdated', function() {
        var roles  = Authinfo.getRoles();
        var tabs = [];
        for(var idx = 0; idx < roles.length; idx++) {
          var allowedTabs = Config.roles[roles[idx]];
          if(allowedTabs) {
            tabs = tabs.concat(allowedTabs);
          }
        }
        $scope.tabs = Utils.removeDuplicates(tabs, 'title');
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
        // setActiveTab();
        $scope.setNavigationTab();
      });

      $rootScope.$on('$routeChangeSuccess', function() {
        $scope.setNavigationTab();
      });

      var getTabTitle = function(title) {
        return $filter('translate')(title);
      };

      $scope.setNavigationTab = function() {
        resetActiveTabState();

        for (var idx in $scope.tabs) {
          if ($scope.tabs[idx].link === $location.path()) {
            $scope.tabs[idx].isActive = true;
            break;
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
