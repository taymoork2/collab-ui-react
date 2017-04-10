import { MeService } from './me.service';
import { UserPreferencesService } from './userPreferences.service';
import * as coreUrlConfigModule from 'modules/core/config/urlConfig';

export * from './me.service';
export * from './userPreferences.service';
export * from './user';

export default angular
  .module('core.auth.user', [
    'collab.ui',
    coreUrlConfigModule,
  ])
  .service('MeService', MeService)
  .service('UserPreferencesService', UserPreferencesService)
  .name;
