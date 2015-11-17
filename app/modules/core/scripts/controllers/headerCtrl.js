'use strict';

angular.module('Core')
  .controller('HeaderCtrl', ['$scope', '$translate', 'Config',
    function ($scope, $translate, Config) {
      $scope.icon = 'icon-cisco-logo';
      $translate('loginPage.title').then(function (title) {
        $scope.headerTitle = title;
      });

      $scope.navStyle = 'admin';
    }
  ]);
