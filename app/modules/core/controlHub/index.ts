import proPackModuleName from 'modules/core/proPack';

import { ControlHubService } from './controlHub.service';
import './control-hub.scss';

const tabConfigModule = require('modules/core/config/tabConfig');

export default angular
  .module('core.controlHub', [
    proPackModuleName,
    tabConfigModule,
  ])
  .service('ControlHubService', ControlHubService)
  .name;
