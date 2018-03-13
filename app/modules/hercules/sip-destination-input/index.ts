import { SipDestinationInputComponent } from './sip-destination-input.component';
import * as ngTranslateModuleName from 'angular-translate';
import collabUiModuleName from '@collabui/collab-ui-ng';
import ussServiceModuleName from 'modules/hercules/services/uss.service';
import * as authInfoModuleName from 'modules/core/scripts/services/authinfo';
import modalServiceModuleName from 'modules/core/modal';
import notificationServiceModuleName from 'modules/core/notifications';

import './sip-destination-input.scss';

export default angular.module('hercules.sip-destination-input', [
  ngTranslateModuleName,
  collabUiModuleName,
  modalServiceModuleName,
  authInfoModuleName,
  notificationServiceModuleName,
  ussServiceModuleName,
])
  .component('sipDestinationInput', new SipDestinationInputComponent())
  .name;
