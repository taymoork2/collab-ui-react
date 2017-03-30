import './_cp-member-lookup.scss';

import { CallParkMemberComponent } from './callParkMember.component';
import { callParkMemberNumbersFilter } from './callParkMemberNumbers.filter';
import { NoDirtyOverride } from './noDirty.directive';
import memberService from 'modules/huron/members';
import featureMemberService from 'modules/huron/features';
import callParkService from 'modules/huron/features/callPark/services';

export default angular
  .module('huron.call-park-member', [
    require('scripts/app.templates'),
    require('collab-ui-ng').default,
    require('angular-translate'),
    memberService,
    featureMemberService,
    callParkService,
  ])
  .component('ucCallParkMember', new CallParkMemberComponent())
  .filter('callParkMemberNumbersFilter', callParkMemberNumbersFilter)
  .directive('noDirty', NoDirtyOverride.factory)
  .name;
