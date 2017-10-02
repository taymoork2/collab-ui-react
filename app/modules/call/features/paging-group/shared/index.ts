import { PagingGroupService } from './paging-group.service';
import { PagingNumberService } from './paging-group-number.service';
import { PagingGroupSettingsService } from './paging-group-settings.service';

import notificationModule from 'modules/core/notifications';
import numberModule from 'modules/huron/numbers';
import featuresModule from 'modules/core/featureToggle';
import userServiceModule from 'modules/huron/users';
import placeServiceModule from 'modules/huron/places';
import featureMemberModule from 'modules/huron/features/services';

export * from './paging-group';
export { PagingGroupService };
export { PagingNumberService };
export { PagingGroupSettingsService };

export default angular
  .module('call.features.paging-group.services', [
    require('angular-resource'),
    require('modules/huron/telephony/cmiServices'),
    require('modules/huron/telephony/telephonyConfig'),
    require('modules/core/scripts/services/authinfo'),
    notificationModule,
    numberModule,
    featuresModule,
    userServiceModule,
    placeServiceModule,
    featureMemberModule,
  ])
  .service('PagingGroupService', PagingGroupService)
  .service('PagingNumberService', PagingNumberService)
  .service('PagingGroupSettingsService', PagingGroupSettingsService)
  .name;
