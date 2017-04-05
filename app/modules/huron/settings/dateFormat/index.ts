import { HuronDateFormatComponent } from './dateFormat.component';

export default angular
  .module('huron.settings.date-format', [
    'atlas.templates',
    'collab.ui',
    'pascalprecht.translate',
  ])
  .component('ucDateFormat', new HuronDateFormatComponent())
  .name;
