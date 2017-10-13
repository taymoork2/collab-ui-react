import featureToggleModuleName from 'modules/core/featureToggle';
import * as authinfoModuleName from 'modules/core/scripts/services/authinfo';

import './pro-pack-icon.component.scss';
import { ProPackService } from './proPack.service';
import { ProPackIconComponent } from './pro-pack-icon.component';

export default angular
  .module('core.proPack', [
    authinfoModuleName,
    featureToggleModuleName,
  ])
  .service('ProPackService', ProPackService)
  .component('crProPackIcon', new ProPackIconComponent)
  .name;
