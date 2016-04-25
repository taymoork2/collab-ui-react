(function() {
  'use strict';

  angular.module('Core')
    .controller('GroupPreviewCtrl', GroupPreviewCtrl);

  /* @ngInject */
  function GroupPreviewCtrl($scope, $state) {
    $scope.closePreview = function () {
      $state.go('groups.list');
    };
  }
})();