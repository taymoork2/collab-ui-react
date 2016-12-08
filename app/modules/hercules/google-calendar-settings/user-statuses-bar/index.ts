import { UserStatusesBarComponent } from './user-statuses-bar.component';

require('./_user-statuses-bar.scss');

export default angular
  .module('Hercules')
  .component('userStatusesBar', new UserStatusesBarComponent())
  .name;
