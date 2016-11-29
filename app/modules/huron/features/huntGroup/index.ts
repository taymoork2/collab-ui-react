import './_hunt-group.scss';

import { HuntGroupComponent } from './huntGroup.component';
import huntGroupService from './services';
import callFeatureName from 'modules/huron/features/components/callFeatureName';
import huntGroupNumbers from 'modules/huron/features/huntGroup/huntGroupNumbers';
import callFeatureMembers from 'modules/huron/features/components/callFeatureMembers';
import huntGroupMethod from 'modules/huron/features/huntGroup/huntGroupMethod';
import huntGroupMaxRingTime from 'modules/huron/features/huntGroup/huntGroupMaxRingTime';
import huntGroupMaxWaitTime from 'modules/huron/features/huntGroup/huntGroupMaxWaitTime';
import fallbackDestination from 'modules/huron/features/components/callFeatureFallbackDestination';
import notifications from 'modules/core/notifications';

export default angular
  .module('huron.hunt-group', [
    'atlas.templates',
    'collab.ui',
    'pascalprecht.translate',
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
