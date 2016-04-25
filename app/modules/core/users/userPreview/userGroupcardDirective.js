'use strict';

angular.module('Core')
  .directive('crUserGroupCard', crUserGroupCard);

function crUserGroupCard() {
  return {
    restrict: 'EA',
    replace: true,
    templateUrl: 'modules/core/users/userPreview/userGroupCard.tpl.html',
    link: function () {}
  };
}
