import { PstnReviewComponent } from './pstn-review.component';
import './_pstn-review.scss';

import pstnModelModule from '../pstn.model';

export default angular
  .module('huron.pstn.pstn-review', [
    require('@collabui/collab-ui-ng').default,
    require('angular-translate'),
    pstnModelModule,
  ])
  .component('ucPstnReview', new PstnReviewComponent())
  .name;
