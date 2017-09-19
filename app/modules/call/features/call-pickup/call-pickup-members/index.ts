import { CallPickupMembersComponent } from './call-pickup-members.component';
import memberService from 'modules/huron/members';
import notifications from 'modules/core/notifications';
import featureMemberService from 'modules/huron/features/services';
import callPickupGroupService from 'modules/call/features/call-pickup/shared';
import focusModule from 'modules/core/focus';
import membersModule from 'modules/huron/members';

export default angular
  .module('call.call-pickup.members', [
    require('scripts/app.templates'),
    require('collab-ui-ng').default,
    require('angular-translate'),
    require('modules/core/config/urlConfig'),
    require('modules/huron/telephony/cmiServices'),
    require('modules/core/scripts/services/authinfo'),
    memberService,
    callPickupGroupService,
    notifications,
    featureMemberService,
    focusModule,
    membersModule,
  ])
  .component('ucCallPickupMembers',  new CallPickupMembersComponent())
  .name;
