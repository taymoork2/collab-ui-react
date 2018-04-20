import { ReadonlyComponent } from './read-only.component';
import modalModuleName from 'modules/core/modal';

export default angular.module('core.auth.readonly', [
  require('angular-translate'),
  require('modules/core/scripts/services/authinfo'),
  modalModuleName,
])
  .component('readOnly', new ReadonlyComponent())
  .name;
