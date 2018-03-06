import './first-time-setup.scss';

import { FirstTimeSetupComponent } from './first-time-setup.component';
import { ProPackService } from 'modules/core/proPack/proPack.service';


export default angular.module('mediafusion.media-service-v2.components.first-time-setup', [
  require('angular-translate'),
  require('@collabui/collab-ui-ng').default,
  ProPackService,
])
  .component('firstTimeSetup', new FirstTimeSetupComponent())
  .name;
