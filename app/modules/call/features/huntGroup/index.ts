import './_hunt-group.scss';

import { HuntGroupComponent } from './huntGroup.component';
import huntGroupService from './services';
import callFeatureName from 'modules/call/features/shared/call-feature-name';
import huntGroupNumbers from 'modules/call/features/huntGroup/huntGroupNumbers';
import callFeatureMembers from 'modules/call/features/shared/callFeatureMembers';
import huntGroupMethod from 'modules/call/features/huntGroup/huntGroupMethod';
import huntGroupMaxRingTime from 'modules/call/features/huntGroup/huntGroupMaxRingTime';
import huntGroupMaxWaitTime from 'modules/call/features/huntGroup/huntGroupMaxWaitTime';
import fallbackDestination from 'modules/call/features/shared/callFeatureFallbackDestination';
import notifications from 'modules/core/notifications';

export default angular
  .module('huron.hunt-group', [
    require('scripts/app.templates'),
    require('collab-ui-ng').default,
    require('angular-translate'),
    huntGroupService,
    callFeatureName,
    huntGroupNumbers,
    callFeatureMembers,
    huntGroupMethod,
    huntGroupMaxRingTime,
    huntGroupMaxWaitTime,
    fallbackDestination,
    notifications,
  ])
  .component('ucHuntGroup', new HuntGroupComponent())
  .name;
