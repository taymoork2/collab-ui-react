import './snr.component.scss';

import { SnrComponent } from './snr.component';
import { SnrService } from './snr.service';
import customerServiceModule from 'modules/huron/customer';
import notifications from 'modules/core/notifications';
import phoneNumberModule from 'modules/huron/phoneNumber';
import snrLinesModule from './snr-lines';
import snrWaitTimer from './snr-wait-timer';
import callDestinationTranslateModule from 'modules/call/shared/call-destination-translate';
import lineServiceModule from 'modules/huron/lines/services';

export * from './snr';
export * from './snr.service';

export default angular
  .module('huron.snr', [
    require('@collabui/collab-ui-ng').default,
    require('angular-translate'),
    lineServiceModule,
    callDestinationTranslateModule,
    customerServiceModule,
    notifications,
    phoneNumberModule,
    snrLinesModule,
    snrWaitTimer,
  ])
  .component('ucSnr', new SnrComponent())
  .service('SnrService', SnrService)
  .name;
