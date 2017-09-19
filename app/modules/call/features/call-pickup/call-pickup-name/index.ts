import { CallPickupNameComponent } from './call-pickup-name.component';
import callPickupGroupService from 'modules/call/features/call-pickup/shared';

export default angular
  .module('call.call-pickup.name', [
    require('scripts/app.templates'),
    require('collab-ui-ng').default,
    require('angular-translate'),
    callPickupGroupService,
  ])
  .component('ucCallPickupName',  new CallPickupNameComponent())
  .name;
