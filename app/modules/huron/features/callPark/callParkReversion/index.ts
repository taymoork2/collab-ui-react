import { CallParkReversionComponent } from './callParkReversion.component';
import memberService from 'modules/huron/members';

export default angular
  .module('huron.call-park-reversion', [
    'atlas.templates',
    'collab.ui',
    'pascalprecht.translate',
    'huron.telephoneNumber',
    require('modules/huron/telephony/cmiServices'),
    require('modules/core/scripts/services/authinfo'),
    memberService,
  ])
  .component('ucCallParkReversion', new CallParkReversionComponent())
  .name;
