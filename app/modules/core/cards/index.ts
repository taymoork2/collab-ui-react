import { CardUtils } from './cardUtils.service';

export { CardUtils };

export default angular
  .module('core.cards', [
    require('collab-ui-ng').default,
  ])
  .service('CardUtils', CardUtils)
  .name;
