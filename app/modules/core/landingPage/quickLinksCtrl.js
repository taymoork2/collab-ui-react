'use strict';

angular.module('Core')
  .controller('QuikLinksCtrl', QuikLinksCtrl);

/* @ngInject */
function QuikLinksCtrl($scope, Authinfo) {
  $scope.isPageActive = function (name) {
    return Authinfo.isAllowedState(name);
  };
}
