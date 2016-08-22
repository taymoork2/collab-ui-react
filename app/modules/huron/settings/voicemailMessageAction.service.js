(function () {
  'use strict';

  angular
    .module('Huron')
    .factory('VoicemailMessageAction', VoicemailMessageAction);

  /* @ngInject */
  function VoicemailMessageAction($q, Authinfo, VoicemailMessageActionService) {
    var VOICEMAIL_TO_EMAIL_DISABLED = 1;
    var VOICEMAIL_TO_EMAIL_ENABLED = 3;

    var service = {
      get: get,
      update: update,
      getVoicemailActionEnum: getVoicemailActionEnum,
      isVoicemailToEmailEnabled: isVoicemailToEmailEnabled
    };

    return service;
    /////////////////////

    function get(_userTemplateId) {
      var userTemplateId = _userTemplateId;

      return VoicemailMessageActionService.query({
        customerId: Authinfo.getOrgId(),
        userTemplateId: userTemplateId
      })
        .$promise
        .then(function (messageActions) {
          if (_.isArray(messageActions) && (messageActions.length > 0)) {
            return messageActions[0];
          }

          return $q.reject('Failed to get voicemail to email settings.');
        });
    }

    function update(_voicemailToEmail, _userTemplateId, _messageActionId) {
      var voicemailToEmail = _voicemailToEmail;
      var userTemplateId = _userTemplateId;
      var messageActionId = _messageActionId;

      var data = {
        voicemailAction: getVoicemailActionEnum(voicemailToEmail)
      };

      if (voicemailToEmail) {
        data.relayAddress = 'dummy@test.xyz';
      }

      return VoicemailMessageActionService.update({
        customerId: Authinfo.getOrgId(),
        userTemplateId: userTemplateId,
        messageActionId: messageActionId
      }, data).$promise;
    }

    function getVoicemailActionEnum(_voicemailToEmail) {
      var voicemailToEmail = _voicemailToEmail;
      return voicemailToEmail ? VOICEMAIL_TO_EMAIL_ENABLED : VOICEMAIL_TO_EMAIL_DISABLED;
    }

    function isVoicemailToEmailEnabled(_voicemailAction) {
      var voicemailAction = _voicemailAction;
      return voicemailAction === VOICEMAIL_TO_EMAIL_ENABLED;
    }
  }
})();
