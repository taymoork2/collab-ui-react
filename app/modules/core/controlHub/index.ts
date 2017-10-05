import { ControlHubService } from './controlHub.service';
import FeatureToggleService from 'modules/core/featureToggle';
import './control-hub.scss';

const tabConfigModule = require('modules/core/config/tabConfig');

export default angular
  .module('core.controlHub', [
    FeatureToggleService,
    tabConfigModule,
  ])
  .service('ControlHubService', ControlHubService)
  .name;
