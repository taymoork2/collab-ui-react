(function () {
  'use strict';

  angular
    .module('Huron')
    .directive('ucVoicemail', ucVoicemail);

  function ucVoicemail() {
    var directive = {
      controller: 'VoicemailInfoCtrl',
      restrict: 'EA',
      scope: false,
      templateUrl: 'modules/huron/voicemail/voicemail.tpl.html'
    };

    return directive;
  };

})();
