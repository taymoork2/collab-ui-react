'use strict';

angular.module('wx2AdminWebClientApp')
  .controller('TabsCtrl', ['Config', '$rootScope', '$scope', '$location', 'Log', 'Utils', '$filter', 'Auth', 'Authinfo',
    function(Config, $rootScope, $scope, $location, Log, Utils, $filter, Auth, Authinfo) {

      //update the tabs when Authinfo data has been populated.
      $scope.$on('AuthinfoUpdated', function() {
        console.log(Authinfo.getRoles());
        var roles  = Authinfo.getRoles();
        if (roles.indexOf('Full_Admin') > -1 && roles.indexOf('WX2_User') > -1) {
          $scope.tabs = Utils.removeDuplicates(Config.tabs.fullAdmin.concat(Config.tabs.wx2User));
          console.log($scope.tabs);
        } else if (roles.indexOf('WX2_User') > -1) {
          $scope.tabs = Config.tabs.wx2User;
        } else if (roles.indexOf('Full_Admin') > -1) {
          $scope.tabs = Config.tabs.fullAdmin;
        }
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
          } else {
            $location.path('/login');
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
