import { ConfigurationModalComponent } from './configuration-modal.component';
import { ValueSuggestionsComponent } from './value.component';
require('./_configuration.scss');

export default angular
  .module('Csdm.configuration', [
    'Csdm.services',
    require('angular-resource'),
    require('angular-translate'),
    require('angular-sanitize'),
    require('modules/core/scripts/services/missing-translation-handler.factory').default,
    require('modules/core/analytics'),
  ])
  .component('configurationModal', new ConfigurationModalComponent())
  .component('configValueSuggestions', new ValueSuggestionsComponent())
  .name;
