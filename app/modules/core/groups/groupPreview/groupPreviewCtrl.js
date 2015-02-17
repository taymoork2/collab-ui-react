'use strict';

/* global $ */

angular.module('Core')
  .controller('GroupPreviewCtrl', ['$scope', '$state',
    function ($scope, $state) {

      $scope.closePreview = function () {
        $state.go('groups.list');
      };

    }
  ]);
