import { EmailNotificationsSectionComponent } from './email-notifications-section.component';

require('./_email-notifications-section.scss');

export default angular
  .module('Hercules')
  .component('emailNotificationsSection', new EmailNotificationsSectionComponent())
  .name;
