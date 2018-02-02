import crActionCardsContainerModuleName from './cr-action-cards-container';
import crActionCardModuleName from './cr-action-card';

export default angular.module('core.users.shared.cr-action-cards', [
  crActionCardsContainerModuleName,
  crActionCardModuleName,
])
  .name;
