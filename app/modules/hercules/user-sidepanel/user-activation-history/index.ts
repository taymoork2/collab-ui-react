import { UserActivationHistoryComponent } from './user-activation-history.component';

require('./_user-activation-history.scss');

export default angular
  .module('Hercules')
  .component('userActivationHistory', new UserActivationHistoryComponent())
  .name;
