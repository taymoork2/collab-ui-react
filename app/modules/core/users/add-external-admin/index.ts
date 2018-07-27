import './add-external-admin.scss';

import { AddExternalAdminComponent } from './add-external-admin.component';
import * as ngTranslateModuleName from 'angular-translate';
import collabUiModuleName from '@collabui/collab-ui-ng';

export default angular.module('core.users.add-external-admin', [
  ngTranslateModuleName,
  collabUiModuleName,
])
  .component('addExternalAdmin', new AddExternalAdminComponent())
  .name;
