import { MediaOnHoldComponent } from './mediaOnHold.component';
import { MediaOnHoldService } from './mediaOnHold.service';

import './_moh.scss';

export * from './mediaOnHold';
export * from './mediaOnHold.service';
export * from './mediaOnHold.component';

export default angular
  .module('huron.mediaOnHold', [
    require('scripts/app.templates'),
    require('collab-ui-ng').default,
    require('angular-translate'),
    require('angular-resource'),
  ])
  .component('ucMediaOnHold', new MediaOnHoldComponent())
  .service('MediaOnHoldService', MediaOnHoldService)
  .name;
