import { UserOverviewService } from './userOverview.service';
let UserOverviewCtrl = require('./userOverviewCtrl');

import featureToggleServiceModule from 'modules/core/featureToggle';
import notifictionModule from 'modules/core/notifications';

let coreAuthModule = require('modules/core/auth/auth');
let ngResourceModule = require('angular-resource');

import './_user-overview.scss';

export default angular
  .module('core.users.userOverview', [
    'atlas.templates',
    'collab.ui',
    ngResourceModule,
    notifictionModule,
    coreAuthModule,
    featureToggleServiceModule,
  ])
  .service('UserOverviewService', UserOverviewService)
  .controller('UserOverviewCtrl', UserOverviewCtrl)
  .name;
