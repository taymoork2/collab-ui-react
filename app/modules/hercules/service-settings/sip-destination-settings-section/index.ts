import { SipDestinationSettingsSectionComponent } from './sip-destination-settings-section.component';
import USSServiceModuleName from 'modules/hercules/services/uss.service';
import FeatureToggleServiceModuleName from 'modules/core/featureToggle';
import * as AuthInfoModuleName from 'modules/core/scripts/services/authinfo';
import ModalServiceModuleName from 'modules/core/modal';
import NotificationServiceModuleName from 'modules/core/notifications';

import './_sip-destination-settings-section.scss';

export default angular
  .module('hercules.sip-destination-test-tool', [
    ModalServiceModuleName,
    AuthInfoModuleName,
    FeatureToggleServiceModuleName,
    NotificationServiceModuleName,
    USSServiceModuleName,
  ])
  .component('sipDestinationSettingsSection', new SipDestinationSettingsSectionComponent())
  .name;
