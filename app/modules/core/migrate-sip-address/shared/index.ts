import * as userListModuleName from 'modules/core/scripts/services/userlist.service';
import { MigrateSipAddressService } from './migrate-sip-address.service';

export default angular
  .module('core.migrate-sip-address.shared', [
    userListModuleName,
  ])
  .service('MigrateSipAddressService', MigrateSipAddressService)
  .name;
