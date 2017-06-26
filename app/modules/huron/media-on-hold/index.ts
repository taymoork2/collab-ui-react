import { MediaOnHoldService } from './media-on-hold.service';

export * from './media-on-hold';
export * from './media-on-hold.service';

export default angular
  .module('huron.mediaOnHold', [
    require('scripts/app.templates'),
    require('collab-ui-ng').default,
    require('angular-translate'),
    require('angular-resource'),
  ])
  .service('MediaOnHoldService', MediaOnHoldService)
  .name;
