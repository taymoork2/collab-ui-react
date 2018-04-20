import './call-park.component.scss';

import { CallParkService } from './call-park.service';
import { CallParkComponent } from './call-park.component';
import { CallParkAddDirectiveFactory } from './call-park-add.directive';
import { CallParkEditDirectiveFactory } from './call-park-edit.directive';
import callParkNumber from './call-park-number';
import callParkFallbackDestination from 'modules/call/features/call-park/call-park-fallback-destination';
import callParkReversionTimer from './call-park-reversion-timer';
import huronSiteService from 'modules/huron/sites';
import callFeaturesShared from 'modules/call/features/shared';
import notifications from 'modules/core/notifications';

export * from './call-park.service';
export * from './call-park';

export default angular
  .module('call.features.call-park', [
    require('@collabui/collab-ui-ng').default,
    require('angular-translate'),
    callParkNumber,
    callParkFallbackDestination,
    callParkReversionTimer,
    huronSiteService,
    callFeaturesShared,
    notifications,
    require('angular-resource'),
    require('modules/huron/telephony/cmiServices'),
    require('modules/huron/telephony/telephonyConfig'),
    require('modules/core/scripts/services/authinfo'),
  ])
  .service('CallParkService', CallParkService)
  .component('ucCallPark', new CallParkComponent())
  .directive('ucCallParkAdd', CallParkAddDirectiveFactory)
  .directive('ucCallParkEdit', CallParkEditDirectiveFactory)
  .name;
