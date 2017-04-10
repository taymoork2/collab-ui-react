import { GoogleCalendarNotificationsDropdownComponent } from './google-calendar-notifications-dropdown.component';

require('./_google-calendar-notifications-dropdown.scss');

export default angular
  .module('Hercules')
  .component('googleCalendarNotificationsDropdown', new GoogleCalendarNotificationsDropdownComponent())
  .name;
