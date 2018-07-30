import './site-list.scss';

import { BsftSiteListComponent } from './site-list.component';

export default angular
  .module('call.bsft.site-list', [
    require('@collabui/collab-ui-ng').default,
    require('angular-translate'),
  ])
  .component('bsftSiteList', new BsftSiteListComponent())
  .name;
