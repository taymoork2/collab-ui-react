import './_learn-more.scss';
import { LearnMoreComponent } from './learnMore.component';

export default angular
  .module('premium.learnMore', [
    require('modules/core/analytics'),
    require('@collabui/collab-ui-ng').default,
    require('angular-translate'),
  ])
  .component('learnMore', new LearnMoreComponent())
  .name;
