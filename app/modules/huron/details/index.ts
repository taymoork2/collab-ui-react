import { HuronDetailsHeaderComponent } from './huronDetailsHeader.component';
import featureToggleModule from 'modules/core/featureToggle';

export default angular
  .module('huron.details', [
    require('scripts/app.templates'),
    require('collab-ui-ng').default,
    require('angular-translate'),
    require('modules/core/auth/auth'),
    require('modules/core/config/config').default,
    featureToggleModule,
  ])
  .component('ucHuronDetailsHeader', new HuronDetailsHeaderComponent())
  .name;
