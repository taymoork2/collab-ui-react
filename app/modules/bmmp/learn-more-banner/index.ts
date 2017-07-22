import { LearnMoreBannerComponent } from './learnMoreBanner.component';
import { LearnMoreBannerService } from './learnMoreBanner.service';
import BmmpModule from 'modules/bmmp';
import ProPackModule from 'modules/core/proPack';
import './learn-more-banner.scss';

export default angular
  .module('bmmp.learn-more-banner', [
    require('scripts/app.templates'),
    require('collab-ui-ng').default,
    require('angular-translate'),
    require('modules/core/analytics'),
    require('modules/core/scripts/services/authinfo'),
    BmmpModule,
    ProPackModule,
  ])
  .component('learnMoreBanner', new LearnMoreBannerComponent())
  .service('LearnMoreBannerService', LearnMoreBannerService)
  .name;
