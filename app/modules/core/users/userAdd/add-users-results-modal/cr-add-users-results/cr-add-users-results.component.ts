import { IOnboardedUsersResultsErrorsAndWarnings } from 'modules/core/users/shared/onboard/onboard.interfaces';
import { FeatureToggleService } from 'modules/core/featureToggle';
import OnboardService from 'modules/core/users/shared/onboard/onboard.service';

interface ICsvRow {
  email: string;
  status: string;
}

export class CrAddUsersResultsController implements ng.IComponentController {

  public convertUsersFlow: boolean;
  public numAddedUsers: number;
  public numUpdatedUsers: number;
  public convertedUsers: string[];
  public pendingUsers: string[];
  public ftF7208: boolean;
  public results: IOnboardedUsersResultsErrorsAndWarnings;

  /* @ngInject */
  constructor(
    private $q: ng.IQService,
    private $state: ng.ui.IStateService,
    private $translate: ng.translate.ITranslateService,
    private Analytics,
    private OnboardService: OnboardService,
    private FeatureToggleService: FeatureToggleService,
  ) {
    this.FeatureToggleService.supports(this.FeatureToggleService.features.atlasF7208GDPRConvertUser).then(supports => {
      this.ftF7208 = supports;
    });
  }

  public fixBulkErrors() {
    // TODO (mipark2): this should no longer be needed, rm after confirmation
    // if (this.isFtw) {
    //   this.wizard.goToStep('manualEntry');
    // } else {
    //   this.Analytics.trackAddUsers(this.Analytics.sections.ADD_USERS.eventNames.GO_BACK_FIX, null, this.createPropertiesForAnalytics());
    //   this.$state.go('users.add.manual');
    // }
    const analyticsProps = this.OnboardService.createPropertiesForAnalytics(this.numUpdatedUsers, this.numAddedUsers, _.size(this.results.errors));
    this.Analytics.trackAddUsers(this.Analytics.sections.ADD_USERS.eventNames.GO_BACK_FIX, null, analyticsProps);
    this.$state.go('users.add.manual');
  }

  public exportCSV(): ng.IPromise<ICsvRow[]> {
    return this.$q((resolve) => {
      const csv: ICsvRow[] = [];
      const statusConverted: string = this.$translate.instant('convertUsersModal.convertedStatus.converted');
      const statusPending: string = this.$translate.instant('convertUsersModal.convertedStatus.pending');

      // push column headers
      csv.push({
        email: this.$translate.instant('convertUsersModal.tableHeader.email'),
        status: this.$translate.instant('convertUsersModal.tableHeader.status'),
      });

      // push row data
      if (_.isArray(this.convertedUsers)) {
        this.convertedUsers.sort();
        _.forEach(this.convertedUsers, function (convertedUser) {
          csv.push({
            email: convertedUser,
            status: statusConverted,
          });
        });
      }

      // push row data
      if (_.isArray(this.pendingUsers)) {
        this.pendingUsers.sort();
        _.forEach(this.pendingUsers, function (pendingUser) {
          csv.push({
            email: pendingUser,
            status: statusPending,
          });
        });
      }

      resolve(csv);
    });
  }
}

export class CrAddUsersResultsComponent implements ng.IComponentOptions {
  public controller = CrAddUsersResultsController;
  public template = require('./cr-add-users-results.html');
  public bindings = {
    convertUsersFlow: '<',
    numAddedUsers: '<',
    numUpdatedUsers: '<',
    convertedUsers: '<',
    pendingUsers: '<',
    results: '<',
  };
}
