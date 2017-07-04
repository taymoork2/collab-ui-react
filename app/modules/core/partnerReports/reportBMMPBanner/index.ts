import { ReportBMMPBannerComponent } from './reportBMMPBanner.component';
import BmmpModule from 'modules/bmmp';
import ProPackModule from 'modules/core/proPack';

export default angular
  .module('reports.reportBanner', [
    require('scripts/app.templates'),
    require('collab-ui-ng').default,
    require('angular-translate'),
    require('modules/core/analytics'),
    require('modules/core/scripts/services/authinfo'),
    BmmpModule,
    ProPackModule,
  ])
  .component('reportBmmpBanner', new ReportBMMPBannerComponent())
  .name;
