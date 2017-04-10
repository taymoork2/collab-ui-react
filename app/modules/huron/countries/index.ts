import { HuronCountryService } from './country.service';

export * from './country.service';
export * from './country';

export default angular
  .module('huron.country-service', [
    require('angular-resource'),
    require('modules/huron/telephony/telephonyConfig'),
  ])
  .service('HuronCountryService', HuronCountryService)
  .name;
