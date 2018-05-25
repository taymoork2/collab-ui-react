import { SitesGridComponent } from './sites-grid.component';

require('angular-ui-grid/ui-grid.js');

export default angular
  .module('core.siteList.site-grid', [
    require('angular-translate'),
    require('@collabui/collab-ui-ng').default,
    'ui.grid',
  ])
  .component('sitesGrid', new SitesGridComponent())
  .name;
