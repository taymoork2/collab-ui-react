import { CardNotificationsComponent } from './card-notifications.component';

export { CardNotificationsComponent };

export default angular
  .module('core.cardNotifications', [
    require('@collabui/collab-ui-ng').default,
    require('angular-translate'),
  ])
  .component('cardNotifications', new CardNotificationsComponent())
  .name;
