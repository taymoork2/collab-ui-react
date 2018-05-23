import { VoicemailComponent } from './settings-voicemail.component';
import serviceSetupModule from 'modules/huron/serviceSetup';
import phoneNumberModule from 'modules/huron/phoneNumber';

export default angular
  .module('call.settings.voicemail', [
    require('@collabui/collab-ui-ng').default,
    require('angular-translate'),
    require('modules/core/featureToggle').default,
    serviceSetupModule,
    phoneNumberModule,
  ])
  .component('ucVoicemail', new VoicemailComponent())
  .name;
