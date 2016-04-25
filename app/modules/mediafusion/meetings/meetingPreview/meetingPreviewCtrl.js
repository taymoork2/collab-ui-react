'use strict';

angular.module('Mediafusion')
  .controller('MeetingPreviewCtrl', MeetingPreviewCtrl);

/* @ngInject */
function MeetingPreviewCtrl($scope, $state) {
  $scope.closePreview = function () {
    $state.go('meetings.list');
  };
}
