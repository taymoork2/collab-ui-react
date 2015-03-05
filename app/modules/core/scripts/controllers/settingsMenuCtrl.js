'use strict';

angular.module('Core')
  .controller('SettingsMenuCtrl', ['$scope', '$location', '$state', '$translate', 'Authinfo', 'Utils',
    function ($scope, $location, $state, $translate, Authinfo, Utils) {
      $scope.menuItems = [];

      var initialSetupText = $translate.instant('settings.initialSetup');

      var getAuthinfoData = function () {
        var found = false;
        if (Authinfo.isCustomerAdmin()) {
          for (var i = 0, l = $scope.menuItems.length; i < l; i++) {
            if ($scope.menuItems[i].title === initialSetupText) {
              found = true;
            }
          }
          if (!found) {
            $scope.menuItems.push({
              link: '/initialsetup',
              title: initialSetupText
            });
          }
        }
      };
      if (Utils.isAdminPage()) {
        getAuthinfoData();
      }
      //update the scope when Authinfo data has been populated.
      $scope.$on('AuthinfoUpdated', function () {
        getAuthinfoData();
      });

      $scope.doAction = function (path) {
        if (path === '/initialsetup') {
          $state.go('setupwizardmodal');
        } else {
          $location.path(path);
        }
      };
    }

  ]);
