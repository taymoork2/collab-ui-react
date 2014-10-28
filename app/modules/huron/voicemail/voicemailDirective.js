'use strict';

angular.module('Huron')

.directive('voicemailInfo', [
  function() {
    return {
      controller: 'VoicemailInfoCtrl',
      restrict: 'EA',
      scope: false,
      templateUrl: 'modules/huron/voicemail/voicemail.tpl.html'
    };
  }
]);