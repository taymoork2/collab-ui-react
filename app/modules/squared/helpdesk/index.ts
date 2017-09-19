import { HelpdeskMockData } from './mock-data';

export default angular
  .module('squared.helpdesk', [
    require('modules/core/config/urlConfig'),
    require('modules/core/config/config').default,
    require('./license.service'),
  ])
  .service('HelpdeskMockData', HelpdeskMockData)
  .name;
