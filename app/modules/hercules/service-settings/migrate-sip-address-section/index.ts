import * as ngTranslateModuleName from 'angular-translate';
import modalModuleName from 'modules/core/modal';
import { MigrateSipAddressSectionComponent } from './migrate-sip-address-section.component';

export default angular
  .module('hercules.service-settings.migrate-sip-address-section', [
    modalModuleName,
    ngTranslateModuleName,
  ])
  .component('migrateSipAddressSection', new MigrateSipAddressSectionComponent())
  .name;
