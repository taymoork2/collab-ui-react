(function() {
  'use strict';

  angular.module('Core')
    .controller('HeaderCtrl', HeaderCtrl);

  /* @ngInject */
  function HeaderCtrl($scope, $translate, Config) {
    $scope.icon = 'icon-cisco-logo';
    $translate('loginPage.title').then(function (title) {
      $scope.headerTitle = title;
    });

    $scope.navStyle = 'admin';
  }
})();