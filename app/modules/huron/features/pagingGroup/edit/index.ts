import { PgEditComponent } from './pgEdit.component';

import pagingGroupService from 'modules/huron/features/pagingGroup';
import featureMemberService from 'modules/huron/features';
import featureToggleService from 'modules/core/featureToggle';

export default angular
  .module('huron.paging-group.edit', [
    'atlas.templates',
    'collab.ui',
    'pascalprecht.translate',
    require('modules/core/notifications').default,
    pagingGroupService,
    featureMemberService,
    featureToggleService,
  ])
  .component('pgEdit', new PgEditComponent())
  .name;
