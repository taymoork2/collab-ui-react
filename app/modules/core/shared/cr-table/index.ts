import { CrTableComponent } from './cr-table.component';
export * from './cr-table.interface';

export default angular.module('core.shared.cr-table', [
  require('angular-translate'),
  require('@collabui/collab-ui-ng').default,
])
  .component('crTable', new CrTableComponent())
  .name;
