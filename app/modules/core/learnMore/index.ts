import './_learn-more.scss';
import { LearnMoreComponent } from './learnMore.component';

export default angular
  .module('premium.learnMore', [
    require('modules/core/analytics'),
    require('collab-ui-ng').default,
    require('scripts/app.templates'),
    require('angular-translate'),
  ])
  .component('learnMore', new LearnMoreComponent())
  .name;
