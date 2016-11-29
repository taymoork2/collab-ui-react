import { VoicemailService } from './voicemail.service';

export * from './voicemail.service';

export default angular
  .module('huron.voicemail.services', [
    require('angular-resource'),
    require('modules/huron/telephony/telephonyConfig'),
    require('modules/core/scripts/services/authinfo'),

  ])
  .service('VoicemailService', VoicemailService)
  .name;
