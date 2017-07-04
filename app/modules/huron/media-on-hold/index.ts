import { MediaOnHoldService } from './media-on-hold.service';

export * from './media-on-hold';
export * from './media-on-hold.service';

export default angular
  .module('huron.media-on-hold', [
    require('scripts/app.templates'),
    require('collab-ui-ng').default,
    require('angular-translate'),
    require('angular-resource'),
    require('modules/core/scripts/services/authinfo'),
    require('modules/huron/telephony/telephonyConfig'),
  ])
  .service('MediaOnHoldService', MediaOnHoldService)
  .name;
