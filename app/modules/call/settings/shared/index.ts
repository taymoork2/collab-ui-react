import { HuronSettingsService } from './settings.service';
import { HuronSettingsOptionsService } from './settings-options.service';
import { ExtensionLengthService } from './extension-length.service';
import { RoutingPrefixLengthService } from './routing-prefix-length.service';
import { CallSettingsService, CallSettingsData } from './settings-location.service';

export * from './settings.service';
export * from './settings-options.service';
export * from './extension-length.service';
export * from './routing-prefix-length.service';
export { CallSettingsService, CallSettingsData };
export const E911_ADDRESS_PENDING: string = 'PENDING';

import siteServiceModule from 'modules/huron/sites';
import customerServiceModule from 'modules/huron/customer';
import serviceSetupModule from 'modules/huron/serviceSetup';
import avrilServiceModule from 'modules/call/avril';
import terminusServiceName from 'modules/huron/pstn/terminus.service';
import mediaOnHoldModule from 'modules/huron/media-on-hold';
import internalNumberRangeServiceModule from 'modules/call/shared/internal-number-range';

export default angular
  .module('huron.settings.services', [
    require('modules/huron/lineSettings/callerIdService'),
    require('modules/call/settings/shared/voicemail-message-action.service'),
    siteServiceModule,
    customerServiceModule,
    serviceSetupModule,
    avrilServiceModule,
    terminusServiceName,
    mediaOnHoldModule,
    internalNumberRangeServiceModule,
  ])
  .service('HuronSettingsService', HuronSettingsService)
  .service('HuronSettingsOptionsService', HuronSettingsOptionsService)
  .service('ExtensionLengthService', ExtensionLengthService)
  .service('RoutingPrefixLengthService', RoutingPrefixLengthService)
  .service('CallSettingsService', CallSettingsService)
  .name;
