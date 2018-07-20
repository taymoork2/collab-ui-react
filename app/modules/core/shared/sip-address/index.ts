import configModuleName from 'modules/core/config/config';
import * as urlConfigModuleName from 'modules/core/config/urlConfig';
import featureToggleModuleName from 'modules/core/featureToggle';
import * as authinfoModuleName from 'modules/core/scripts/services/authinfo';
import orgSettingsModuleName from 'modules/core/shared/org-settings';
import { SipAddressService } from './sip-address.service';

export default angular
  .module('core.shared.sip-address', [
    authinfoModuleName,
    configModuleName,
    featureToggleModuleName,
    orgSettingsModuleName,
    urlConfigModuleName,
  ])
  .service('SipAddressService', SipAddressService)
  .name;
