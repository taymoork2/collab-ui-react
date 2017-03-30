import { CallPickupNameComponent } from './callPickupName.component';
import callPickupGroupService from 'modules/huron/features/callPickup/services/';

export default angular
  .module('huron.call-pickup.name', [
    require('scripts/app.templates'),
    require('collab-ui-ng').default,
    'pascalprecht.translate',
    callPickupGroupService,
  ])
  .component('callPickupName',  new CallPickupNameComponent())
  .name;
