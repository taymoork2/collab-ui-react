import { TrialRegionalSettingsComponent } from './trialRegionalSettings.component';
import HuronCountryService from 'modules/huron/countries';
import FeatureToggleServices from 'modules/core/featureToggle';

export default angular
  .module('trial.regionalSettings', [
    require('scripts/app.templates'),
    'collab.ui',
    'pascalprecht.translate',
    HuronCountryService,
    FeatureToggleServices,
  ])
  .component('trialRegionalSettings', new TrialRegionalSettingsComponent())
  .name;
