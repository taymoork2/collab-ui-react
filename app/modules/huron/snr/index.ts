import { SnrComponent } from './snr.component';
import { SnrService } from './snr.service';
import customerServiceModule from 'modules/huron/customer';
import notifications from 'modules/core/notifications';
import phoneNumberModule from 'modules/huron/phoneNumber';

export * from './snr';
export * from './snr.service';

export default angular
  .module('huron.snr', [
    require('@collabui/collab-ui-ng').default,
    require('angular-translate'),
    'call.shared.call-destination-translate',
    customerServiceModule,
    notifications,
    phoneNumberModule,
  ])
  .component('ucSnr', new SnrComponent())
  .service('SnrService', SnrService)
  .name;
