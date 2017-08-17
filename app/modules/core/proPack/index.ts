import './pro-pack-icon.component.scss';
import { ProPackService } from './proPack.service';
import { ProPackIconComponent } from './pro-pack-icon.component';
import FeatureToggleService from 'modules/core/featureToggle';

export default angular
  .module('core.proPack', [
    FeatureToggleService,
  ])
  .service('ProPackService', ProPackService)
  .component('crProPackIcon', new ProPackIconComponent)
  .name;
