import './call-park.component.scss';

import { CallParkComponent } from './call-park.component';
import callParkNumber from './call-park-number';
import callFeatureMember from 'modules/call/features/shared/call-feature-members';
import callParkFallbackDestination from 'modules/call/features/call-park/call-park-fallback-destination';
import callParkReversionTimer from './call-park-reversion-timer';
import callParkService from './services';
import callFeatureName from 'modules/call/features/shared/call-feature-name';
import huronSiteService from 'modules/huron/sites';
import notifications from 'modules/core/notifications';

export default angular
  .module('huron.call-park', [
    require('scripts/app.templates'),
    require('collab-ui-ng').default,
    require('angular-translate'),
    callFeatureName,
    callParkNumber,
    callFeatureMember,
    callParkFallbackDestination,
    callParkReversionTimer,
    callParkService,
    huronSiteService,
    notifications,
    require('angular-resource'),
    require('modules/huron/telephony/cmiServices'),
    require('modules/huron/telephony/telephonyConfig'),
    require('modules/core/scripts/services/authinfo'),
  ])
  .component('ucCallPark', new CallParkComponent())
  .name;
