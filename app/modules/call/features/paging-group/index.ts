import './paging-group.component.scss';

import { PagingGroupComponent } from './paging-group.component';
import pagingGroupService from 'modules/call/features/paging-group/shared';
import featureToggleService from 'modules/core/featureToggle';
import featureMemberService from 'modules/huron/features/services';
import callFeatureMembers from 'modules/call/features/shared/call-feature-members';
import callFeaturesName from 'modules/call/features/shared/call-feature-name';
import pagingGroupNumber from 'modules/call/features/paging-group/paging-group-number';
import pagingGroupInitiator from 'modules/call/features/paging-group/paging-group-initiator';
import huronPlaceModule from 'modules/huron/places';
import accessibilityModule from 'modules/core/accessibility';

export default angular
  .module('call.features.paging-group', [
    require('@collabui/collab-ui-ng').default,
    require('angular-translate'),
    require('modules/core/notifications').default,
    accessibilityModule,
    pagingGroupService,
    featureMemberService,
    featureToggleService,
    callFeatureMembers,
    callFeaturesName,
    pagingGroupNumber,
    pagingGroupInitiator,
    huronPlaceModule,
  ])
   .component('ucPagingGroup', new PagingGroupComponent())
  .name;
