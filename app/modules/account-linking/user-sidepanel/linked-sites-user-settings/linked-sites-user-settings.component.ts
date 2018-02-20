import { Notification } from 'modules/core/notifications';
import { UserOverviewService } from 'modules/core/users/userOverview';

class LinkedSitesUserSettingsComponentCtrl implements ng.IComponentController {

  private userId: string;
  private linkedTrainSiteNames: string[];
  private userPreferences: object;

  /* @ngInject */
  constructor(
    private UserOverviewService: UserOverviewService,
    private Notification: Notification,
    ) { }

  public $onChanges(changes: {[bindings: string]: ng.IChangesObject<any>}) {
    const { userId } = changes;
    if (userId && userId.currentValue) {
      this.userId = userId.currentValue;
      this.UserOverviewService.getUser(this.userId)
        .then((response) => {
          this.linkedTrainSiteNames = response.user.linkedTrainSiteNames;
          this.userPreferences = this.parseUserPreferences(_.get(response, 'user.userPreferences', []));
        })
        .catch((error) => {
          this.Notification.errorWithTrackingId(error, 'accountLinking.errors.unableToRetrieveData');
        });
    }
  }

  public hasLinkedWebexSites(): boolean {
    return !_.isEmpty(this.linkedTrainSiteNames);
  }

  private parseUserPreferences(userPreferenceKeyValPairs: string[]): Object {
    return _.reduce(userPreferenceKeyValPairs, (result, keyValPair) => {
      keyValPair = keyValPair ? keyValPair : '';

      const sanitizedKeyValPair = keyValPair .replace(/"/g, '');
      const [key, val] = _.split(sanitizedKeyValPair, ':');
      result[key] = val;
      return result;
    }, {});
  }

  public getPreferredWebExSite(): string {
    return _.get(this.userPreferences, 'preferredWebExSite', '');
  }

}

export class LinkedSitesUserSettingsComponent implements ng.IComponentOptions {
  public controller = LinkedSitesUserSettingsComponentCtrl;
  public template = require('./linked-sites-user-settings.component.html');
  public bindings = {
    userId: '<',
  };
}
