import { IdleTimeoutService } from './idleTimeout.service';
import windowModule from 'modules/core/window';
import FeatureToggleService from 'modules/core/featureToggle';
import storageModule from 'modules/core/storage';

export default angular
  .module('core.auth.idleTimeout', [
    require('modules/core/config/config').default,
    require('modules/core/scripts/services/log'),
    require('modules/core/auth/auth'),
    storageModule,
    FeatureToggleService,
    windowModule,
  ])
   .service('IdleTimeoutService', IdleTimeoutService)
  .name;
