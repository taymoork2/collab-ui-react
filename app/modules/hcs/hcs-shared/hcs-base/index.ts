import { HcsSharedHeaderComponent } from './hcs-shared-header.component';
import featureToggleModule from 'modules/core/featureToggle';

export default angular
  .module('hcs.sharedHeader', [
    require('@collabui/collab-ui-ng').default,
    require('angular-translate'),
    featureToggleModule,
  ])
  .component('hcsSharedHeader', new HcsSharedHeaderComponent())
  .name;
