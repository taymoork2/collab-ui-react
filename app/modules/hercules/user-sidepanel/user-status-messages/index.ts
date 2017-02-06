import { UserStatusMessagesComponent } from './user-status-messages.component';

require('./_user-status-messages.scss');

export default angular
  .module('Hercules')
  .component('userStatusMessages', new UserStatusMessagesComponent())
  .name;
