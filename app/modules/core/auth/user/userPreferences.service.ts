import { IUser } from './index';

const KEY_SCHEMAS: string = 'schemas';
const KEY_USER_PREF: string = 'userPreferences';

export interface IPreferenceOperation {
  value: string;
  operation?: string;
}

export class UserPreferencesService {

  // known User Preferences
  public static USER_PREF_LAUNCH: string = 'SparkHideLaunch';
  public static USER_PREF_TOS: string = 'SparkTOSAccept';
  public static DELETE_OP = 'delete';

  public allPrefs: string[] = [
    UserPreferencesService.USER_PREF_LAUNCH,
    UserPreferencesService.USER_PREF_TOS,
  ];

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

  public setUserPreferences(user: IUser, prefId: string, value: boolean): ng.IPromise<IUser> {

    const updateUserPreferences: Object[] = [];

    // set status of each preference
    _.forEach(this.allPrefs, (pref) => {
      const preference: IPreferenceOperation = {
        value: pref,
      };

      // if preference was already set, or we are disabling it, the set to delete it
      if (_.isEqual(prefId, pref)) {
        if (!value) {
          // turn off this preference
          preference.operation = UserPreferencesService.DELETE_OP;
        }
      } else if (!this.hasPreference(user, pref)) {
        // wasn't set before
        preference.operation = UserPreferencesService.DELETE_OP;
      }

      updateUserPreferences.push(preference);
    });

    const body: Object = {};
    body[KEY_SCHEMAS] = user.schemas;
    body[KEY_USER_PREF] = updateUserPreferences;
    return this.$http.patch<IUser>(user.meta.location, body)
      .then(response => response.data);
  }

}
