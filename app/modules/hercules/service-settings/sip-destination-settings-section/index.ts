import { SipDestinationSettingsSectionComponent } from './sip-destination-settings-section.component';
import ussServiceModuleName from 'modules/hercules/services/uss.service';
import hybridServicesClusterServiceModuleName from 'modules/hercules/services/hybrid-services-cluster.service';
import featureToggleServiceModuleName from 'modules/core/featureToggle';
import * as authInfoModuleName from 'modules/core/scripts/services/authinfo';

import './sip-destination-settings-section.scss';

export default angular
  .module('hercules.sip-destination-test-tool', [
    authInfoModuleName,
    featureToggleServiceModuleName,
    hybridServicesClusterServiceModuleName,
    ussServiceModuleName,
  ])
  .component('sipDestinationSettingsSection', new SipDestinationSettingsSectionComponent())
  .name;
