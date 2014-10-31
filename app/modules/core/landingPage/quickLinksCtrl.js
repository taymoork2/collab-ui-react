'use strict';

angular.module('Core')

.controller('QuikLinksCtrl', ['$scope', 'Authinfo',
  function($scope, Authinfo) {

    $scope.isPageActive = function(name) {
      return Authinfo.isAllowedState(name);
    };
  }
]);