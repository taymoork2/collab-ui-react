import { PgEditComponent } from './pgEdit.component';

import pagingGroupService from 'modules/huron/features/pagingGroup';

export default angular
  .module('huron.paging-group.edit', [
    'atlas.templates',
    'collab.ui',
    'pascalprecht.translate',
    require('modules/core/notifications').default,
    pagingGroupService,
  ])
  .component('pgEdit', new PgEditComponent())
  .name;
