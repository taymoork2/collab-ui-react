import { LinkedSitesGridComponent } from './linked-sites-grid.component';

export default angular
  .module('account-linking.sites-grid', [
    require('@collabui/collab-ui-ng').default,
    require('angular-translate'),
  ])
  .component('linkedSitesGrid', new LinkedSitesGridComponent())
  .name;
