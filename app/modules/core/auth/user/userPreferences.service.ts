import { IUser } from './index';

const VALUE = 'value';
const DELETE = 'delete';
const OPERATION = 'operation';
const KEY_SCHEMAS: string = 'schemas';
const KEY_USER_PREF: string = 'userPreferences';

export class UserPreferencesService {

  public static USER_PREF_LAUNCH: string = 'SparkHideLaunch';
  public static USER_PREF_TOS: string = 'SparkTOSAccept';

  /* @ngInject */
  constructor(
    private $http: ng.IHttpService,
  ) {
  }

  public hasPreference(user: IUser, preference: string): Boolean {
    return _.some(user.userPreferences, (o) => {
      return _.isEqual(o, preference);
    });
  }

  public setUserPreferences(user: IUser): ng.IPromise<IUser> {

    let updateUserPreferences: Array<Object> = [];
    let preference: Object = {};

    preference[VALUE] = UserPreferencesService.USER_PREF_TOS;
    if (!user.hideToS) {
      preference[OPERATION] = DELETE;
    }
    updateUserPreferences.push(preference);

    preference = {};
    preference[VALUE] = UserPreferencesService.USER_PREF_LAUNCH;
    if (!user.hideLaunch) {
      preference[OPERATION] = DELETE;
    }
    updateUserPreferences.push(preference);

    let body: Object = {};
    body[KEY_SCHEMAS] = user.schemas;
    body[KEY_USER_PREF] = updateUserPreferences;
    return this.$http.patch<IUser>(user.meta.location, body)
      .then(response => {
        return response.data;
      });
  }

}
