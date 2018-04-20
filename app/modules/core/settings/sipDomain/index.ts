import { SipDomainSettingComponent } from './sipDomainSetting.component';

import './_sip-domain-settings.scss';

import notificationModule from 'modules/core/notifications';
import featureToggleModule from 'modules/core/featureToggle';

export default angular.module('core.settings.sipDomain', [
  require('angular-cache'),
  require('angular-translate'),
  require('@collabui/collab-ui-ng').default,
  require('modules/core/config/config').default,
  require('modules/hercules/services/service-descriptor.service').default,
  require('modules/core/scripts/services/sparkDomainManagement.service'),
  notificationModule,
  featureToggleModule,
])
  .component('sipdomainSetting', new SipDomainSettingComponent())
  .name;
