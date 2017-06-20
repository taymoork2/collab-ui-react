import { LineLabelComponent } from './lineLabel.component';
import { LineLabelService } from './lineLabel.service';
import FeatureToggleService from 'modules/core/featureToggle';

export default angular
  .module('huron.line-label', [
    require('scripts/app.templates'),
    require('collab-ui-ng').default,
    require('angular-translate'),
    FeatureToggleService,
  ])
  .component('ucLineLabel', new LineLabelComponent())
  .service('LineLabelService', LineLabelService)
  .name;
