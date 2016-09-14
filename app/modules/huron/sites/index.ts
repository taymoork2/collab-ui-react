import { HuronSiteService } from './site.service';

export * from './site.service';

export default angular
  .module('huron.site-service', [
    require('angular-resource'),
    require('modules/core/scripts/services/authinfo'),
    require('modules/huron/telephony/telephonyConfig'),
  ])
  .service('HuronSiteService', HuronSiteService)
  .name;