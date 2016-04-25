'use strict';

angular.module('Core')
  .directive('crEditServices', crEditServices);

function crEditServices() {
  return {
    restrict: 'EA',
    templateUrl: 'modules/core/users/userPreview/editServices.tpl.html',
    controller: 'OnboardCtrl'
  };
}
