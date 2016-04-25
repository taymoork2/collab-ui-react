(function() {
  'use strict';

  angular.module('Mediafusion')
    .directive('crPartInfoCard', crPartInfoCard);

  function crPartInfoCard() {
    return {
      restrict: 'EA',
      replace: true,
      templateUrl: 'modules/mediafusion/meetings/meetingPreview/participantInfoCard.tpl.html',
      link: function () {}
    };
  }
})();