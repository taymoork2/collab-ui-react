import { ResultsViewComponent } from './results-view.component';
import './_results.scss';

import notifications from 'modules/core/notifications';
import hcsTestManagerServiceModule from '../shared';

export default angular
  .module('hcs.taas.results', [
    require('angular-resource'),
    require('angular-translate'),
    require('modules/core/cards').default,
    require('@collabui/collab-ui-ng').default,
    require('modules/core/config/config').default,
    hcsTestManagerServiceModule,
    notifications,
  ])
.component('taasResultsView', new ResultsViewComponent())
.name;
