import './call-feature-members.component.scss';

import { CallFeatureMembersComponent } from './call-feature-members.component';
import { callFeatureMemberPrimaryNumberFilter } from './call-feature-member-primary-number.filter';
import { callFeatureMemberNumberFormatterFilter } from './call-feature-member-number-formatter.filter';
import memberService from 'modules/huron/members';
import featureMemberService from 'modules/huron/features/services';
import noDirtyOverride from 'modules/call/features/shared/no-dirty-override';
import phoneNumberModule from 'modules/huron/phoneNumber';

export default angular
  .module('call.features.shared.members', [
    require('collab-ui-ng').default,
    require('angular-translate'),
    require('dragular'),
    phoneNumberModule,
    memberService,
    featureMemberService,
    noDirtyOverride,
  ])
  .component('ucCallFeatureMembers', new CallFeatureMembersComponent())
  .filter('callFeatureMemberPrimaryNumberFilter', callFeatureMemberPrimaryNumberFilter)
  .filter('callFeatureMemberNumberFormatterFilter', callFeatureMemberNumberFormatterFilter)
  .name;
