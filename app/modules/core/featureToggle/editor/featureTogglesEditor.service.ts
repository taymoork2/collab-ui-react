import { IUser } from 'modules/core/auth/user';

export interface IFeatureToggle {
  deletedTime?: number;
  group?: string;
  key: string;
  lastModified?: string;
  mutable: boolean;
  percentage?: number;
  type: string;
  val: string;
  value: boolean;
  isUpdating?: boolean;
}

export interface IUserPreference {
  key: string;
  value: boolean;
}

/**
 * Service for modifying user preferences and feature toggles
 */
export class FeatureToggleEditorService {
  private featuresUrl: string;

  /* @ngInject */
  constructor(
    private $q: ng.IQService,
    private $http: ng.IHttpService,
    private UrlConfig,
    private UserPreferencesService,
  ) {
    this.featuresUrl = this.UrlConfig.getFeatureUrl() + '/features/users';
  }

  /**
   * return list of UserPreferences
   */
  public updateUserPreferences(user: IUser): ng.IPromise<IUserPreference[]> {
    const preferences = _.map(this.UserPreferencesService.allPrefs,
      (id: string) => {
        return {
          key: id,
          value: this.UserPreferencesService.hasPreference(user, id),
        };
      });
    return this.$q.resolve(preferences);
  }

  public updateUserPreference(user: IUser, pref: IUserPreference): ng.IPromise<void> {
    return this.UserPreferencesService.setUserPreferences(user, pref.key, pref.value);
  }

  /**
   * Return list of DEV Feature featureToggles
   */
  public getFeatureToggles(userId: string): ng.IPromise<IFeatureToggle[]> {
    const url = `${this.featuresUrl}/${userId}/developer`;
    return this.$http.get(url, { cache: false })
      .then((response) => {
        const toggles = _.get<IFeatureToggle[]>(response.data, 'featureToggles');

        // remove all non-dev feature toggles
        _.remove(toggles, (feature: IFeatureToggle) => {
          return !feature.mutable || !_.isEqual(feature.type, 'DEV');
        });

        // ensure that feature.value is a boolean set from feature.val
        _.forEach(toggles, (feature: IFeatureToggle) => {
          feature.value = this.isTrue(feature.val);
          feature.isUpdating = false;
        });

        return toggles;
      });
  }

  /**
   * Add a new Feature Toggle with the passed id
   */
  public addToggle(userId: string, toggleId: string): ng.IPromise<IFeatureToggle> {
    const url = `${this.featuresUrl}/${userId}/developer`;
    const body = {
      key: toggleId,
      val: false,
      mutable: true,
    };
    return this.$http.post(url, body)
      .then((response) => {
        const toggle = <IFeatureToggle>response.data;
        toggle.value = this.isTrue(toggle.val);
        toggle.isUpdating = false;
        return toggle;
      });
  }

  /**
   * Write data for this feature toggle
   */
  public updateToggle(userId: string, feature: IFeatureToggle): ng.IPromise<IFeatureToggle> {
    const url = `${this.featuresUrl}/${userId}/developer`;
    const body = {
      key: feature.key,
      val: feature.value,
      mutable: true,
    };
    return this.$http.post(url, body)
      .then((response) => {
        const toggle = <IFeatureToggle>response.data;
        toggle.value = this.isTrue(toggle.val);
        toggle.isUpdating = false;
        return toggle;
      });
  }

  /**
   * Delete the named toggle
   */
  public deleteToggle(userId: string, toggleId: string): ng.IHttpPromise<IFeatureToggle> {
    const url = `${this.featuresUrl}/${userId}/developer/${toggleId}`;
    return this.$http.delete(url);
  }

  //////////////////////////////
  private isTrue(val: string): boolean {
    return (val.toLowerCase() === 'true');
  }

}
