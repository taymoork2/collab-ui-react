'use strict';

angular.module('Core')
  .controller('HeaderCtrl', ['$scope', '$translate', 'Config',
    function ($scope, $translate, Config) {
      //remove after spark branding is done
      if (Config.getEnv() === 'sparkprod' || Config.getEnv() === 'sparkint') {
        $scope.icon = '/images/sparkSm.png';
      } else {
        $scope.icon = '/images/cisco_logo.png';
        angular.element('.app-icon').css('width', '47px').css('margin-top', '-4px').css('margin-left', '-4px');
      }

      $translate('loginPage.title').then(function (title) {
        $scope.headerTitle = title;
      });

      $scope.navStyle = 'admin';
    }
  ]);
