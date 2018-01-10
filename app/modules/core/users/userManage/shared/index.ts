import licenseSummaryModuleName from './license-summary';

export default angular
  .module('core.users.userManage.shared', [
    require('angular-ui-router'),
    require('@collabui/collab-ui-ng').default,
    licenseSummaryModuleName,
  ])
  .name;
