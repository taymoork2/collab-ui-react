'use strict';

angular
  .module('Core')
  .controller('HeaderPushCtrl', ['$scope', '$translate',
    function ($scope, $translate) {
      $scope.label = 'License Usage';
      $scope.state = 'normal';
      $scope.icon = 'icon-star';
    }
  ]);
