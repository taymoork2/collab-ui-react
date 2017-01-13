import './_cp-reversion.scss';

import { CallParkReversionComponent } from './callParkReversion.component';
import { callParkReversionDirectoryNumberFilter } from './callParkReversionDirectoryNumber.filter';
import memberService from 'modules/huron/members';
import numberService from 'modules/huron/numbers';
import callParkService from 'modules/huron/features/callPark/services';

export default angular
  .module('huron.call-park-reversion', [
    'atlas.templates',
    'collab.ui',
    'pascalprecht.translate',
    'huron.telephoneNumber',
    require('modules/huron/telephony/cmiServices'),
    require('modules/core/scripts/services/authinfo'),
    memberService,
    numberService,
    callParkService,
  ])
  .component('ucCallParkReversion', new CallParkReversionComponent())
  .filter('callParkReversionDirectoryNumberFilter', callParkReversionDirectoryNumberFilter)
  .name;
