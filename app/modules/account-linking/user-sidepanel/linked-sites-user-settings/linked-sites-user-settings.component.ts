import { UserOverviewService } from 'modules/core/users/userOverview/userOverview.service';

class LinkedSitesUserSettingsComponentCtrl implements ng.IComponentController {

  private userId: string;
  private linkedTrainSiteNames: string[];
  private userPreferences: string[];

  /* @ngInject */
  constructor(
    private UserOverviewService: UserOverviewService,
  ) { }

  public $onChanges(changes: {[bindings: string]: ng.IChangesObject<any>}) {
    const { userId } = changes;
    if (userId && userId.currentValue) {
      this.userId = userId.currentValue;
      this.UserOverviewService.getUser(this.userId)
        .then((response) => {
          this.linkedTrainSiteNames = response.user.linkedTrainSiteNames;
          this.userPreferences = response.user.userPreferences;
        })
        .catch((error) => {
          throw error;
        });
    }
  }

  public haveLinkedWebexSites(): boolean {
    return !_.isEmpty(this.linkedTrainSiteNames);
  }

  public getPreferredWebExSite(): string {
    if (!_.isEmpty(this.userPreferences)) {
      const preferredSite = _.find(this.userPreferences, function (userPreference) {
        return userPreference.indexOf('preferredWebExSite') > 0;
      });
      if (_.isString(preferredSite)) {
        return preferredSite.substring(preferredSite.indexOf(':') + 1).replace(/"/g, '');
      }
    }
    return '';
  }

}

export class LinkedSitesUserSettingsComponent implements ng.IComponentOptions {
  public controller = LinkedSitesUserSettingsComponentCtrl;
  public template = require('./linked-sites-user-settings.component.html');
  public bindings = {
    userId: '<',
  };
}
