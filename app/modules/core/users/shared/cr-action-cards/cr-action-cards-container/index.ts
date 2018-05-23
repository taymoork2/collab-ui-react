import './cr-action-cards-container.scss';

import { CrActionCardsContainerComponent } from './cr-action-cards-container.component';

export default angular.module('core.users.shared.cr-action-cards.cr-action-cards-container', [
])
  .component('crActionCardsContainer', new CrActionCardsContainerComponent())
  .name;
