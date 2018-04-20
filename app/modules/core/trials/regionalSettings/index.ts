import { TrialRegionalSettingsComponent } from './trialRegionalSettings.component';
import { TrialRegionalSettingsFTSWDirectiveFactory } from './regionalSettingsFTSW.directive';
import { TrialRegionalSettingsSectionDirectiveFactory } from './regionalSettingsSection.directive';
import HuronCountryService from 'modules/huron/countries';
import FeatureToggleServices from 'modules/core/featureToggle';

export default angular
  .module('trial.regionalSettings', [
    require('modules/core/trials/trial.module'),
    require('@collabui/collab-ui-ng').default,
    require('angular-translate'),
    HuronCountryService,
    FeatureToggleServices,
  ])
  .component('trialRegionalSettings', new TrialRegionalSettingsComponent())
  .directive('trialRegionalSettingsSection', TrialRegionalSettingsSectionDirectiveFactory)
  .directive('trialRegionalSettingsFtsw', TrialRegionalSettingsFTSWDirectiveFactory)
  .name;
