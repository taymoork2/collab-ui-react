'use strict';

angular.module('Core')
  .directive('crGroupInfoCard', crGroupInfoCard);

function crGroupInfoCard() {
  return {
    restrict: 'EA',
    replace: true,
    templateUrl: 'modules/core/groups/groupPreview/groupInfoCard.tpl.html',
    link: function () {}
  };
}
