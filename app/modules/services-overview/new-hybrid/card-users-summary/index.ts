import './card-users-summary.scss';

import { CardUsersSummaryComponent } from './card-users-summary.component';
import * as ngTranslateModuleName from 'angular-translate';
import collabUiModuleName from '@collabui/collab-ui-ng';

export default angular.module('services-overview.new-hybrid.cards-users-summary', [
  ngTranslateModuleName,
  collabUiModuleName,
])
  .component('cardUsersSummary', new CardUsersSummaryComponent())
  .name;
