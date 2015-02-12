'use strict';

/* global $ */

angular.module('Mediafusion')
  .controller('MeetingPreviewCtrl', ['$scope', '$state',
    function ($scope, $state) {
      $scope.closePreview = function () {
        $state.go('meetings.list');
      };
    }
  ]);
