(function () {
  'use strict';

  angular
    .module('Mediafusion')
    .directive('ucMeetingsCard', ucMeetingsCard);

  function ucMeetingsCard() {
    var directive = {
      restrict: 'EA',
      scope: false,
      templateUrl: 'modules/mediafusion/media-service-report-v2/meetings-report/meetingsCard/meetingInfoCard.tpl.html'
    };

    return directive;
  }

})();
