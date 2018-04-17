import { PrimaryLineComponent } from './primaryLine.component';
import { PrimaryLineService } from './primaryLine.service';
import Notification from 'modules/core/notifications';
import featureToggleModule from 'modules/core/featureToggle';

export * from './primaryLine.interfaces';
export * from './primaryLine.service';
export * from './primaryLine';

export default angular
  .module('huron.primaryLine', [
    require('@collabui/collab-ui-ng').default,
    require('angular-resource'),
    Notification,
    featureToggleModule,
  ])
  .component('ucPrimaryLine', new PrimaryLineComponent())
  .service('PrimaryLineService', PrimaryLineService)
  .name;
