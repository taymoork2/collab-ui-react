import { MediaOnHoldService } from './media-on-hold.service';
import { MediaOnHoldComponent } from './media-on-hold.component';
import './moh.scss';

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
  .component('ucMediaOnHold', new MediaOnHoldComponent())
  .service('MediaOnHoldService', MediaOnHoldService)
  .name;
