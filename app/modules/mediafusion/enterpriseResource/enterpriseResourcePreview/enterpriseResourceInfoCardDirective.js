'use strict';

angular.module('Mediafusion')
  .directive('crEntResInfoCard', crEntResInfoCard);

function crEntResInfoCard() {
  return {
    restrict: 'EA',
    replace: true,
    templateUrl: 'modules/mediafusion/enterpriseResource/enterpriseResourcePreview/enterpriseResourceInfoCard.tpl.html',
    link: function () {}
  };
}
