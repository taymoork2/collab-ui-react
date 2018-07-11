import focusModuleName from 'modules/core/focus';
import { MigrateSipAddressSearchModalComponent } from './migrate-sip-address-search-modal.component';
import './migrate-sip-address-search-modal.scss';

export default angular
  .module('core.migrate-sip-address.search-modal', [
    focusModuleName,
  ])
  .component('migrateSipAddressSearchModal', new MigrateSipAddressSearchModalComponent())
  .name;
