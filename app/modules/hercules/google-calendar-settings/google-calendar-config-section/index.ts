import { GoogleCalendarConfigSectionComponent } from './google-calendar-config-section.component';

require('./_google-calendar-config-section.scss');

export default angular
  .module('Hercules')
  .component('googleCalendarConfigSection', new GoogleCalendarConfigSectionComponent())
  .name;
