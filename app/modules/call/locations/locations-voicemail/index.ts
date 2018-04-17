import { LocationsVoicemailComponent } from './locations-voicemail.component';
import phoneNumberModule from 'modules/huron/phoneNumber';
import serviceSetup from 'modules/huron/serviceSetup';

export { LocationsVoicemailComponent };

export default angular
  .module('call.locations.locations-voicemail', [
    require('angular-translate'),
    require('@collabui/collab-ui-ng').default,
    phoneNumberModule,
    serviceSetup,
  ])
  .component('ucLocationVoicemail', new LocationsVoicemailComponent())
  .name;
