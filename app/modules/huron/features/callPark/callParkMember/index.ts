import { CallParkMemberComponent } from './callParkMember.component';
import { callParkMemberNumbersFilter } from './callParkMemberNumbers.filter';
import { NoDirtyOverride } from './noDirty.directive';
import memberService from 'modules/huron/members';
import featureMemberService from 'modules/huron/features';
import callParkService from 'modules/huron/features/callPark/services';

export default angular
  .module('huron.call-park-member', [
    'atlas.templates',
    'collab.ui',
    'pascalprecht.translate',
    memberService,
    featureMemberService,
    callParkService,
  ])
  .component('ucCallParkMember', new CallParkMemberComponent())
  .filter('callParkMemberNumbersFilter', callParkMemberNumbersFilter)
  .directive('noDirty', NoDirtyOverride.factory)
  .name;
