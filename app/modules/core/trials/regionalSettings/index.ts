import { TrialRegionalSettingsComponent } from './trialRegionalSettings.component';

export default angular
  .module('trial.regionalSettings', [
    'atlas.templates',
    'collab.ui',
    'pascalprecht.translate',
  ])
  .component('trialRegionalSettings', new TrialRegionalSettingsComponent())
  .name;
