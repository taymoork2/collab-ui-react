import { ProPackService } from './proPack.service';
import FeatureToggleService from 'modules/core/featureToggle';

export default angular
  .module('core.proPack', [
    FeatureToggleService,
  ])
  .service('ProPackService', ProPackService)
  .name;
