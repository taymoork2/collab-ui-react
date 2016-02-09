/* global ll */
'use strict';

angular.module('Squared')
  .controller('TabsCtrl', ['Config', '$rootScope', '$scope', '$location', 'Log', 'Utils', '$filter', 'Auth', 'Authinfo',
    function (Config, $rootScope, $scope, $location, Log, Utils, $filter, Auth, Authinfo) {

      function setNavigationTab() {
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

        var activeTab = _.find($scope.tabs, {
          isActive: true
        });
        if (activeTab) {
          ll('tagEvent', 'Tab Clicked', {
            'Tab Name': $scope.tabs[idx]
          });
        }
      }

      function resetActiveTabState() {
        for (var idx in $scope.tabs) {
          $scope.tabs[idx].isActive = false;
        }
      }

      $scope.tabs = Authinfo.getTabs();
      setNavigationTab();

      $scope.$on('AuthinfoUpdated', function () {
        $scope.tabs = Authinfo.getTabs();
        setNavigationTab();
      });

      $rootScope.$on('$stateChangeSuccess', function () {
        setNavigationTab();
      });

      $rootScope.$on('TABS_UPDATED', function () {
        $scope.tabs = Authinfo.getTabs();
      });
    }
  ]);
