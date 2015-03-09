'use strict';

angular.module('Core')

.directive('crEditServices', function () {
  return {
    restrict: 'EA',
    templateUrl: 'modules/core/users/userPreview/editServices.tpl.html',
    controller: 'OnboardCtrl'
  };
});
