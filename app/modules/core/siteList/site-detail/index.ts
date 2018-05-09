import './_site-detail.scss';

import { SiteDetailComponent } from './site-detail.component';

import siteListSharedModuleName from 'modules/core/siteList/shared';

export default angular
  .module('core.siteList.site-detail', [
    require('angular-translate'),
    require('@collabui/collab-ui-ng').default,
    siteListSharedModuleName,
  ])
  .component('siteDetail', new SiteDetailComponent())
  .name;
