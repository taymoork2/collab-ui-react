import './pro-pack-icon.component.scss';
import { ProPackService } from './proPack.service';
import { ProPackIconComponent } from './pro-pack-icon.component';
import FeatureToggleService from 'modules/core/featureToggle';
import HelpDeskModule from 'modules/squared/helpdesk';

export default angular
  .module('core.proPack', [
    require('modules/core/config/config').default,
    FeatureToggleService,
    HelpDeskModule,
  ])
  .service('ProPackService', ProPackService)
  .component('crProPackIcon', new ProPackIconComponent)
  .name;
