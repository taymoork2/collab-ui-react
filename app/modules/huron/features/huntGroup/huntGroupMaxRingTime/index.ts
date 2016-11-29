import { HuntGroupMaxRingTimeComponent } from './huntGroupMaxRingTime.component';

export default angular
  .module('huron.hunt-group-max-ring-time', [
    'atlas.templates',
    'collab.ui',
    'pascalprecht.translate',
  ])
  .component('ucHuntGroupMaxRingTime', new HuntGroupMaxRingTimeComponent())
  .name;
