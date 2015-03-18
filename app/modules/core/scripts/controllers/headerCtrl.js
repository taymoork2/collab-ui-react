'use strict';

angular.module('Core')
  .controller('HeaderCtrl', ['$scope', '$translate', 'Config',
    function ($scope, $translate, Config) {
      $scope.icon = '/images/sparkSm.png';
      $translate('loginPage.title').then(function (title) {
        $scope.headerTitle = title;
      });

      $scope.navStyle = 'admin';
    }
  ]);
