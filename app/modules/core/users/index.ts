import userOverview from './userOverview';
import userCsv from './userCsv';
import userManage from './userManage';
import './_users.scss';

export default angular
  .module('core.users', [
    userOverview,
    userCsv,
    userManage,
  ])
  .name;
