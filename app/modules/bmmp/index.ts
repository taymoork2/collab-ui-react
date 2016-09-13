import { BmmpService } from './bmmp.service';
require('bmmp/cisco-bmmp.js');

export * from './bmmp.service';

export default angular
  .module('bmmp', [
    require('modules/core/config/urlConfig'),
    require('modules/core/scripts/services/authinfo'),
  ])
  .service('BmmpService', BmmpService)
  .name;