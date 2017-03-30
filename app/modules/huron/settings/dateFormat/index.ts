import { HuronDateFormatComponent } from './dateFormat.component';

export default angular
  .module('huron.settings.date-format', [
    require('scripts/app.templates'),
    'collab.ui',
    'pascalprecht.translate',
  ])
  .component('ucDateFormat', new HuronDateFormatComponent())
  .name;
