'use strict';

angular.module('wx2AdminWebClientApp')
  .controller('TabsCtrl', ['Config', '$rootScope', '$scope', '$location', 'Log', 'Utils', '$filter', 'Auth', 'Authinfo',
    function(Config, $rootScope, $scope, $location, Log, Utils, $filter, Auth, Authinfo) {

      //update the tabs when Authinfo data has been populated.
      $scope.$on('AuthinfoUpdated', function() {
        var roles  = Authinfo.getRoles();
        var tabs = [];
        for(var idx = roles.length - 1; idx >= 0; idx--) {
          tabs = tabs.concat(Config.roles[roles[idx]]);
        }
        $scope.tabs = Utils.removeDuplicates(tabs, 'title');
        Authinfo.setTabs($scope.tabs);
        //Check if this is an allowed tab
        if(!Authinfo.isAllowedTab()){
          $location.path('/login');
        }
        setActiveTab();
      });

      $scope.navType = 'pills';

      var setActiveTab = function() {
        var curPath = $location.path();
        for (var idx in $scope.tabs) {
          var tab = $scope.tabs[idx];
          if (tab.path === curPath) {
            tab.active = 'true';
            break;
          }
        }
      };

      $scope.getTabTitle = function(title) {
        return $filter('translate')(title);
      };

      $scope.changeTab = function(tabPath) {
        if (Utils.isAdminPage()) {
          Log.debug('using path: ' + tabPath);
          $location.path(tabPath);
        }
      };
    }
  ]);
