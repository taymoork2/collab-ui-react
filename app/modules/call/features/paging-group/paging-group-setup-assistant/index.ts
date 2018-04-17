import { PgSetupAssistantComponent } from './paging-group-setup-assistant.component';

import pagingGroupService from 'modules/call/features/paging-group/shared';
import featureToggleService from 'modules/core/featureToggle';
import pgName from './paging-group-name';
import pgNumber from './paging-group-number';
import pgMember from './paging-group-member';
import pgInitiator from './paging-group-initiator';

export default angular
  .module('call.features.paging-group-setup-assistant', [
    require('@collabui/collab-ui-ng').default,
    require('angular-translate'),
    pgName,
    pgNumber,
    pgMember,
    pgInitiator,
    pagingGroupService,
    featureToggleService,
  ])
  .component('pgSetupAssistant', new PgSetupAssistantComponent())
  .name;
