(function () {
  'use strict';

  angular.module('Core')
    .directive('crGroupDetailsCard', crGroupDetailsCard);

  function crGroupDetailsCard() {
    return {
      restrict: 'AE',
      transclude: true,
      replace: true,
      templateUrl: 'modules/core/groups/groupPreview/groupDetailsCard.tpl.html',
      link: function () {}
    };
  }
})();
