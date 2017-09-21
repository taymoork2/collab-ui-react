import userOverview from './userOverview';
import userCsv from './userCsv';
import userManage from './userManage';
import userTaskMgr from './userTaskMgr';
import './_users.scss';

export default angular
  .module('core.users', [
    userOverview,
    userCsv,
    userManage,
    userTaskMgr,
  ])
  .name;
