import { CallParkMemberComponent } from './callParkMember.component';
import { callParkMemberNumbersFilter } from './callParkMemberNumbers.filter';
import memberService from 'modules/huron/members';

export default angular
  .module('huron.call-park-member', [
    'atlas.templates',
    'collab.ui',
    'pascalprecht.translate',
    memberService,
  ])
  .component('ucCallParkMember', new CallParkMemberComponent())
  .filter('callParkMemberNumbersFilter', callParkMemberNumbersFilter)
  .name;
