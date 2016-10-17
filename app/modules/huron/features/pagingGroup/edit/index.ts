import { PgEditComponent } from './pgEdit.component';

import pagingGroupService from '../../pagingGroup';

export default angular
  .module('huron.paging-group.edit', [
    'atlas.templates',
    'cisco.ui',
    'pascalprecht.translate',
    require('modules/core/notifications/notifications.module'),
    pagingGroupService,
  ])
  .component('pgEdit', new PgEditComponent())
  .name;
