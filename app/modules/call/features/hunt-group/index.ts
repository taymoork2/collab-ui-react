import './hunt-group.component.scss';

import { HuntGroupComponent } from './hunt-group.component';
import { HuntGroupService } from './hunt-group.service';
import huntGroupNumbers from 'modules/call/features/hunt-group/hunt-group-numbers';
import huntGroupMethod from 'modules/call/features/hunt-group/hunt-group-method';
import huntGroupMaxRingTime from 'modules/call/features/hunt-group/hunt-group-max-ring-time';
import huntGroupMaxWaitTime from 'modules/call/features/hunt-group/hunt-group-max-wait-time';
import callFeaturesShared from 'modules/call/features/shared';
import huntGroupCallsToSparkApp from 'modules/call/features/hunt-group/hunt-group-calls-to-spark-app';
import notifications from 'modules/core/notifications';
import featureToggle from 'modules/core/featureToggle';
import huntGroupFallback from 'modules/call/features/hunt-group/hunt-group-fallback-destination';

export * from './hunt-group';
export * from './hunt-group.service';

export default angular
  .module('call.features.hunt-group', [
    require('collab-ui-ng').default,
    require('angular-translate'),
    huntGroupNumbers,
    huntGroupMethod,
    huntGroupMaxRingTime,
    huntGroupMaxWaitTime,
    callFeaturesShared,
    huntGroupCallsToSparkApp,
    notifications,
    featureToggle,
    huntGroupFallback,
  ])
  .service('HuntGroupService', HuntGroupService)
  .component('ucHuntGroup', new HuntGroupComponent())
  .name;
