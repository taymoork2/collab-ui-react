import { AccountService } from './account.service';
import * as authinfo from 'modules/core/scripts/services/authinfo.js';
import * as urlconfig from 'modules/core/config/urlConfig.js';
import * as angularCache from 'angular-cache';

export default angular.module('core.account', [
  angularCache,
  authinfo,
  urlconfig,
]).service('AccountService', AccountService)
  .name;
