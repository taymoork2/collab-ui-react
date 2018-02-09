import { SipDestinationSettingsSectionComponent } from './sip-destination-settings-section.component';
import ussServiceModuleName from 'modules/hercules/services/uss.service';
import * as authInfoModuleName from 'modules/core/scripts/services/authinfo';
import modalServiceModuleName from 'modules/core/modal';
import notificationServiceModuleName from 'modules/core/notifications';

import './_sip-destination-settings-section.scss';

export default angular
  .module('hercules.sip-destination-test-tool', [
    modalServiceModuleName,
    authInfoModuleName,
    notificationServiceModuleName,
    ussServiceModuleName,
  ])
  .component('sipDestinationSettingsSection', new SipDestinationSettingsSectionComponent())
  .name;
