import { TimeZoneComponent } from './timeZone.component';

export * from './timeZone.component';

export default angular
  .module('huron.settings.time-zone', [
    'atlas.templates',
    'collab.ui',
    'pascalprecht.translate',
  ])
  .component('ucTimeZone', new TimeZoneComponent())
  .name;
