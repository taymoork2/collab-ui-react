import { CardUtils } from './cardUtils.service';

export { CardUtils };

export default angular
  .module('core.cards', [
    'collab.ui',
  ])
  .service('CardUtils', CardUtils)
  .name;
