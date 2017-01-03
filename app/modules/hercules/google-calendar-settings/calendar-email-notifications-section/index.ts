import { CalendarEmailNotificationsSectionComponent } from './calendar-email-notifications-section.component';

require('./_calendar-email-notifications-section.scss');

export default angular
  .module('Hercules')
  .component('calendarEmailNotificationsSection', new CalendarEmailNotificationsSectionComponent())
  .name;
