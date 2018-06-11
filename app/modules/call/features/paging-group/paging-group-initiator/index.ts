import './paging-group-initiator.component.scss';

import { PagingGroupIntitiatorComponent } from './paging-group-initiator.component';

import callFeatureMembers from 'modules/call/features/shared/call-feature-members';

export default angular
  .module('call.features.paging-group-initiator', [
    require('@collabui/collab-ui-ng').default,
    require('angular-translate'),
    callFeatureMembers,
  ])
  .component('ucPagingGroupInitiator', new PagingGroupIntitiatorComponent())
  .name;
