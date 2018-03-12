import './first-time-setup.scss';
import { FirstTimeSetupComponent } from './first-time-setup.component';
import ProPackModule from 'modules/core/proPack';


export default angular.module('mediafusion.media-service-v2.components.first-time-setup', [
  require('angular-translate'),
  require('@collabui/collab-ui-ng').default,
  ProPackModule,
])
  .component('firstTimeSetup', new FirstTimeSetupComponent())
  .name;
