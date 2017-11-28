import userOverview from './userOverview';
import userCsv from './userCsv';
import userManage from './userManage';
import userTaskManagerModal from './user-task-manager';
import './_users.scss';
import sharedModuleName from './shared';

export default angular
  .module('core.users', [
    userOverview,
    userCsv,
    userManage,
    userTaskManagerModal,
    sharedModuleName,
  ])
  .name;
