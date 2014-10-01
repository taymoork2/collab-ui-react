'use strict';

angular.module('Squared')
  .controller('TabsCtrl', ['Config', '$rootScope', '$scope', '$location', 'Log', 'Utils', '$filter', 'Auth', 'Authinfo',
    function(Config, $rootScope, $scope, $location, Log, Utils, $filter, Auth, Authinfo) {

      // keep this empty until all processing is done.
      // Otherwise user will see unlocalized tabs.
      $scope.tabs = [];

      //TODO refactor roles/links strategy
      var filterLinks = function(tabs) {
        if (!Authinfo.supportsHuron()) {
          for (var i in Config.serviceLinks.huron) {
            removeLink(tabs, Config.serviceLinks.huron[i]);
          }
        }
      };

      var removeLink = function(tabs, link) {
        for (var i = 0; i < tabs.length; i++) {
          if (tabs[i] && tabs[i].link === link) {
            tabs.splice(i--, 1);
          }
          else if (tabs[i] && tabs[i].subPages) {
            for (var j = 0; j < tabs[i].subPages.length; j++) {
              if (tabs[i].subPages[j] && tabs[i].subPages[j].link === link) {
                tabs[i].subPages.splice(j--, 1);
              }
            }
          }
        }
      };

      //update the tabs when Authinfo data has been populated.
      $scope.$on('AuthinfoUpdated', function() {
        var roles  = Authinfo.getRoles();
        var allowedTabs = [];
        var tabs = Config.tabs.slice();

        // Collect all allowed tabs from assigned roles
        for(var x = 0; x < roles.length; x++) {
          allowedTabs = allowedTabs.concat(Config.roles[roles[x]]);
        }

        var filterTabs = function(idx) {
          return function (el) {
            return el.tab !== Config.tabs[idx].tab;
          };
        };

        // Remove unauthorized tabs
        for(var idx =0; idx < Config.tabs.length; idx++) {
          if (allowedTabs.indexOf(Config.tabs[idx]) === -1) {
            tabs = tabs.filter(filterTabs(idx));
          }
        }
        // Remove unsupported service links
        filterLinks(tabs);

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

      $rootScope.$on('$stateChangeStart', function(event) {
        if (!Auth.isAllowedPath()) {
          Auth.isAuthorized(event.currentScope);
        }
      });

      $rootScope.$on('$stateChangeSuccess', function() {
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
