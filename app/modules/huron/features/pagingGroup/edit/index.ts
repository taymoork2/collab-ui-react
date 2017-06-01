import { PgEditComponent } from './pgEdit.component';

import pagingGroupService from 'modules/huron/features/pagingGroup';
import featureToggleService from 'modules/core/featureToggle';
import featureMemberService from 'modules/huron/features/services';

export default angular
  .module('huron.paging-group.edit', [
    require('scripts/app.templates'),
    require('collab-ui-ng').default,
    require('angular-translate'),
    require('modules/core/notifications').default,
    pagingGroupService,
    featureMemberService,
    featureToggleService,
  ])
  .component('pgEdit', new PgEditComponent())
  .name;
