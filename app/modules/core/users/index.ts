import userOverview from './userOverview';
import userCsv from './userCsv';

export default angular
  .module('core.users', [
    userOverview,
    userCsv,
  ])
  .name;
