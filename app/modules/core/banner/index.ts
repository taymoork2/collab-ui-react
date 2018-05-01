import { BannerComponent } from './banner.component';
import './banner.scss';

export default angular
  .module('core.crBanner', [
    require('angular-translate'),
    require('@collabui/collab-ui-ng').default,
  ])
  .component('crBanner', new BannerComponent())
  .name;
