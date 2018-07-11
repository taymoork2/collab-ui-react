import * as ngTranslateModuleName from 'angular-translate';
import migrateSipAddressModuleName from 'modules/core/migrate-sip-address';
import modalModuleName from 'modules/core/modal';
import { MigrateSipAddressSectionComponent } from './migrate-sip-address-section.component';

export default angular
  .module('hercules.service-settings.migrate-sip-address-section', [
    migrateSipAddressModuleName,
    modalModuleName,
    ngTranslateModuleName,
  ])
  .component('migrateSipAddressSection', new MigrateSipAddressSectionComponent())
  .name;
