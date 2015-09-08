'use strict';

angular.module('Sunlight')
  .controller('SunlightUserOverviewCtrl', ['$scope', '$state',
    function ($scope, $state) {

      $scope.closePreview = function () {
        $state.go('users.list');
      };
    }
  ]);
