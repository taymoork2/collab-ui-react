'use strict';

/* global $ */

angular.module('Core')
  .controller('UserPreviewCtrl', ['$scope', '$rootScope', '$state', 'Userservice', '$window',
    function($scope, $rootScope, $state, Userservice, $window){

      $scope.closePreview = function() {
        $state.go('users.list');
      };

    }]);
