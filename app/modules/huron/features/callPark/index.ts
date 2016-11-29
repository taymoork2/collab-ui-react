import './_call-park.scss';

import { CallParkComponent } from './callPark.component';
import callParkNumber from './callParkNumber';
import callFeatureMember from 'modules/huron/features/components/callFeatureMembers';
import callParkFallbackDestination from 'modules/huron/features/callPark/callParkFallbackDestination';
import callParkReversionTimer from './callParkReversionTimer';
import callParkService from './services';
import callFeatureName from 'modules/huron/features/components/callFeatureName';
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
