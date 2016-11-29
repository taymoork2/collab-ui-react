import { HuntGroupMaxWaitTimeComponent } from './huntGroupMaxWaitTime.component';

export default angular
  .module('huron.hunt-group-max-wait-time', [
    'atlas.templates',
    'collab.ui',
    'pascalprecht.translate',
  ])
  .component('ucHuntGroupMaxWaitTime', new HuntGroupMaxWaitTimeComponent())
  .name;
