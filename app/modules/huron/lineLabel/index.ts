import { LineLabelComponent } from './lineLabel.component';
import FeatureToggleService from 'modules/core/featureToggle';

export default angular
  .module('huron.line-label', [
    require('scripts/app.templates'),
    require('collab-ui-ng').default,
    require('angular-translate'),
    FeatureToggleService,
  ])
  .component('ucLineLabel', new LineLabelComponent())
  .name;
