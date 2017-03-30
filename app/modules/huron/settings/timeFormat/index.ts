import { HuronTimeFormatComponent } from './timeFormat.component';

export default angular
  .module('huron.settings.time-format', [
    require('scripts/app.templates'),
    'collab.ui',
    'pascalprecht.translate',
  ])
  .component('ucTimeFormat', new HuronTimeFormatComponent())
  .name;
