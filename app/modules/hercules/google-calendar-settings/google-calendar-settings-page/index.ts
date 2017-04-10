import { GoogleCalendarSettingsPageComponent } from './google-calendar-settings-page.component';

require('./_google-calendar-settings-page.scss');

export default angular
  .module('Hercules')
  .component('googleCalendarSettingsPage', new GoogleCalendarSettingsPageComponent())
  .name;
