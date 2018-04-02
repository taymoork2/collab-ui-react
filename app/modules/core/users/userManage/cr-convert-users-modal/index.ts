import './cr-convert-users-modal.scss';

import { CrConvertUsersModalComponent } from './cr-convert-users-modal.component';
import * as ngTranslateModuleName from 'angular-translate';
import collabUiModuleName from '@collabui/collab-ui-ng';

export default angular.module('core.users.userManage.cr-convert-users-modal', [
  ngTranslateModuleName,
  collabUiModuleName,
])
  .component('crConvertUsersModal', new CrConvertUsersModalComponent())
  .name;
