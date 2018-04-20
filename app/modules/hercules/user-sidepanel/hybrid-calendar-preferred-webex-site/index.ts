import FeatureToggleServiceModuleName from 'modules/core/featureToggle';
import { HybridCalendarPreferredWebexSiteComponent } from './hybrid-calendar-preferred-webex-site.component';

export default angular
  .module('hercules.hybrid-calendar-preferred-webex-site', [
    FeatureToggleServiceModuleName,
  ])
  .component('hybridCalendarPreferredWebexSite', new HybridCalendarPreferredWebexSiteComponent())
  .name;
