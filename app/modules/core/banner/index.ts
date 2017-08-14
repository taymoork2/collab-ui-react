import { BannerComponent } from './banner.component';
import './banner.scss';

export default angular
  .module('core.crBanner', [
    'core.authinfo',
    require('scripts/app.templates'),
    require('collab-ui-ng').default,
  ])
  .component('crBanner', new BannerComponent())
  .name;
