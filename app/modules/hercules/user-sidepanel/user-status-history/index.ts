import { UserStatusHistoryComponent } from './user-status-history.component';

require('./_user-status-history.scss');

export default angular
  .module('Hercules')
  .component('userStatusHistory', new UserStatusHistoryComponent())
  .name;
