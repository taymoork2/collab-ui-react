import { BannerComponent } from './banner.component';
import './banner.scss';

export default angular
  .module('core.crBanner', [
    'core.authinfo',
    require('@collabui/collab-ui-ng').default,
  ])
  .component('crBanner', new BannerComponent())
  .name;
