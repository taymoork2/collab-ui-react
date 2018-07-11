import searchModalModuleName from './search-modal';
import sharedModuleName from './shared';

export default angular
  .module('core.migrate-sip-address', [
    searchModalModuleName,
    sharedModuleName,
  ])
  .name;
