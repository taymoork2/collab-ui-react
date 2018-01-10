import { CallPickupNameComponent } from './call-pickup-name.component';
import callPickupGroupService from 'modules/call/features/call-pickup/shared';

export default angular
  .module('call.call-pickup.name', [
    require('@collabui/collab-ui-ng').default,
    require('angular-translate'),
    callPickupGroupService,
  ])
  .component('ucCallPickupName',  new CallPickupNameComponent())
  .name;
