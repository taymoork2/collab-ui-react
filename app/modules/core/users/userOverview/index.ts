import { UserOverviewService } from './userOverview.service';
let UserOverviewCtrl = require('./userOverviewCtrl');

import notifiactionModule from 'modules/core/notifications';

let coreAuthModule = require('modules/core/auth/auth');
let featureToggleServiceModule = require('modules/core/featureToggle/featureToggle.service');

import './_user-overview.scss';

export default angular
  .module('core.users.userOverview', [
    'atlas.templates',
    coreAuthModule,
    featureToggleServiceModule,
    notifiactionModule,
    'ngResource',
  ])
  .service('UserOverviewService', UserOverviewService)
  .controller('UserOverviewCtrl', UserOverviewCtrl)
  .name;
