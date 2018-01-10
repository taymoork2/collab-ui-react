import './hunt-group-numbers.component.scss';

import { HuntGroupNumbersComponent } from './hunt-group-numbers.component';
import numberService from 'modules/huron/numbers';
import noDirtyOverride from 'modules/call/features/shared/no-dirty-override';
import featuresModule from 'modules/core/featureToggle';

export default angular
  .module('huron.hunt-group-numbers', [
    require('@collabui/collab-ui-ng').default,
    require('angular-translate'),
    numberService,
    noDirtyOverride,
    featuresModule,
  ])
  .component('ucHuntGroupNumbers', new HuntGroupNumbersComponent())
  .name;
