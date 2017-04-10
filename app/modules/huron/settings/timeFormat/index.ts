import { HuronTimeFormatComponent } from './timeFormat.component';

export default angular
  .module('huron.settings.time-format', [
    'atlas.templates',
    'collab.ui',
    'pascalprecht.translate',
  ])
  .component('ucTimeFormat', new HuronTimeFormatComponent())
  .name;
