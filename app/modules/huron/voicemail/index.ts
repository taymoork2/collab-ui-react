import { VoicemailComponent } from './voicemail.component';
import { HuronVoicemailService } from './voicemail.service';
import customerServiceModule from 'modules/huron/customer';
import userServiceModule from 'modules/huron/users';
import { HuronUserService } from 'modules/huron/users/user.service';
import featureToggleModule from 'modules/core/featureToggle';
import notifications from 'modules/core/notifications';
export * from './voicemail.service';
export default angular
  .module('huron.voicemail', [
    'atlas.templates',
    'collab.ui',
    'pascalprecht.translate',
    customerServiceModule,
    userServiceModule,
    notifications,
    featureToggleModule,
  ])
  .component('ucVoicemail', new VoicemailComponent())
  .service('HuronVoicemailService', HuronVoicemailService)
  .service('HuronUserService ', HuronUserService)
  .name;
