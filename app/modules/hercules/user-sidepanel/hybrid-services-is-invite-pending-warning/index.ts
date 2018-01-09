import { HybridServicesIsInvitePendingWarningComponent } from './hybrid-services-is-invite-pending-warning.component';

import './_hybrid-services-is-invite-pending-warning.scss';

export default angular
  .module('Hercules')
  .component('hsIsInvitePendingWarning', new HybridServicesIsInvitePendingWarningComponent())
  .name;
