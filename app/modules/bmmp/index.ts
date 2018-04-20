import { BmmpService } from './bmmp.service';
require('@atlas/bmmp/cisco-bmmp.js');

export * from './bmmp.service';

export default angular
  .module('bmmp', [
    require('modules/core/config/config').default,
    require('modules/core/config/urlConfig'),
    require('modules/core/scripts/services/authinfo'),
    require('modules/core/storage').default,
  ])
  .service('BmmpService', BmmpService)
  .name;
