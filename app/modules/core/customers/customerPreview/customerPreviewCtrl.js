'use strict';

/* global $ */

angular.module('Core')
  .controller('CustomerPreviewCtrl', ['$scope', '$rootScope', '$state', 'Log', '$window',
    function ($scope, $rootScope, $state, Log, $window) {

      $scope.closePreview = function () {
        $state.go('partnercustomers.list');
      };

    }
  ]);
