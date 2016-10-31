import { CallPickupNameComponent } from './callPickupName.component';

export default angular
  .module('huron.call-pickup.name', [
    'atlas.templates',
    'collab.ui',
    'pascalprecht.translate',
  ])
  .component('callPickupName',  new CallPickupNameComponent())
  .name;
