(function () {
  'use strict';

  angular.module('Mediafusion')
    .directive('crMetInfoCard', crMetInfoCard);

  function crMetInfoCard() {
    return {
      restrict: 'EA',
      replace: true,
      templateUrl: 'modules/mediafusion/meetings/meetingPreview/meetingInfoCard.tpl.html',
      link: function () {}
    };
  }
})();
