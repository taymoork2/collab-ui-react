import { HuronPlaceService } from './place.service';

export { HuronPlaceService };

export default angular
  .module('huron.places', [
    require('angular-resource'),
    require('modules/core/scripts/services/authinfo'),
    require('modules/huron/telephony/telephonyConfig'),
  ])
  .service('HuronPlaceService', HuronPlaceService)
  .name;
