import { NumberService } from './number.service';
import featureToggleServiceModule from 'modules/core/featureToggle';
export * from './number.service';
export * from './number';

export default angular
  .module('huron.number-service', [
    require('angular-resource'),
    require('modules/core/scripts/services/authinfo'),
    require('modules/huron/telephony/telephonyConfig'),
    featureToggleServiceModule,
  ])
  .service('NumberService', NumberService)
  .name;
