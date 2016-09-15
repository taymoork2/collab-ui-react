import { LineService } from './line.service';

export * from './line.service';

export default angular
  .module('huron.line-services', [
    'ngResource',
    require('modules/core/scripts/services/authinfo'),
    require('modules/huron/telephony/telephonyConfig'),
  ])
  .service('LineService', LineService)
  .name;