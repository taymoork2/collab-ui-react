import { LocationCallerIdComponent } from './locations-caller-id.component';
import phoneNumberModule from 'modules/huron/phoneNumber';

export { LocationCallerIdComponent };

export default angular
  .module('call.locations.locations-caller-id', [
    require('@collabui/collab-ui-ng').default,
    require('angular-translate'),
    phoneNumberModule,
  ])
  .component('ucLocationCallerId', new LocationCallerIdComponent())
  .name;
