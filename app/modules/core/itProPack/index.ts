import { ITProPackService } from './itProPack.service';
import FeatureToggleService from 'modules/core/featureToggle';

export default angular
  .module('core.itProPack', [
    FeatureToggleService,
  ])
  .service('ITProPackService', ITProPackService)
  .name;
