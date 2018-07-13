import './ftsw-site-list.scss';

import { FtswSiteListComponent } from './ftsw-site-list.component';

export default angular
  .module('call.bsft.ftsw-site-list', [
    require('@collabui/collab-ui-ng').default,
    require('angular-translate'),
  ])
  .component('ftswSiteList', new FtswSiteListComponent())
  .name;
