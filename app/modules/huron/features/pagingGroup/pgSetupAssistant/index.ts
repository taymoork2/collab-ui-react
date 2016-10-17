import { PgSetupAssistantComponent } from './pgSetupAssistant.component';

import pagingGroupService from '../../pagingGroup';
import pgName from './pgName';
import pgNumber from './pgNumber';

export default angular
  .module('huron.paging-group.setup-assistant', [
    'atlas.templates',
    'collab.ui',
    'pascalprecht.translate',
    pgName,
    pgNumber,
    pagingGroupService,
  ])
  .component('pgSetupAssistant', new PgSetupAssistantComponent())
  .name;
