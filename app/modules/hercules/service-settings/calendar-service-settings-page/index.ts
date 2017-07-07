import { CalendarServiceSettingsPageComponent } from './calendar-service-settings-page.component';

require('./_calendar-service-settings-page.scss');

export default angular
  .module('Hercules')
  .component('calendarServiceSettingsPage', new CalendarServiceSettingsPageComponent())
  .name;
