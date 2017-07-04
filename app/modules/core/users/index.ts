import userOverview from './userOverview';
import userCsv from './userCsv';
import './_users.scss';

export default angular
  .module('core.users', [
    userOverview,
    userCsv,
  ])
  .name;
