import './cr-action-card.scss';

import { CrActionCardComponent } from './cr-action-card.component';

export default angular.module('core.users.shared.cr-action-cards.cr-action-card', [
])
  .component('crActionCard', new CrActionCardComponent())
  .name;
