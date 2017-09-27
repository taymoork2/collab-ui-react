import { IStatusSummary } from 'modules/hercules/services/uss.service';
import { IToolkitModalService } from 'modules/core/modal';

import './card-users-summary.scss';

type SimpleSummary = Pick<IStatusSummary, 'activated' | 'error' | 'notActivated'>;

class CardUsersSummaryController implements ng.IComponentController {
  public summary: IStatusSummary;
  public displayedSummary: SimpleSummary = {
    activated: 0,
    error: 0,
    notActivated: 0,
  };

  /* @ngInject */
  constructor(
    private $modal: IToolkitModalService,
  ) {}

  public $onChanges(changes: { summary: ng.IChangesObject<IStatusSummary[]> }) {
    if (changes.summary && changes.summary.currentValue) {
      this.displayedSummary = _.reduce(changes.summary.currentValue, (acc, summary) => {
        return {
          activated: summary.activated + acc.activated,
          error: summary.error + acc.error,
          notActivated  : summary.notActivated + acc.notActivated,
        };
      }, {
        activated: 0,
        error: 0,
        notActivated: 0,
      });
    }
  }

  public showError() {
    return this.displayedSummary && this.displayedSummary.error > 0;
  }

  public showPending() {
    return !this.showError() && this.displayedSummary.notActivated > 0;
  }

  public showActivated() {
    return !this.showError() && !this.showPending();
  }

  public openUserStatusReportModal = () => {
    this.$modal.open({
      controller: 'ExportUserStatusesController',
      controllerAs: 'exportUserStatusesCtrl',
      template: require('modules/hercules/service-specific-pages/components/user-status-report/export-user-statuses.html'),
      type: 'small',
      resolve: {
        userStatusSummary: () => this.summary,
      },
    });
  }
}

export class CardUsersSummaryComponent implements ng.IComponentOptions {
  public controller = CardUsersSummaryController;
  public template = `
    <div class="active-card_section">
      <div class="active-card_title" translate="servicesOverview.userStatusesSummary.users"></div>
      <div class="active-card_action" ng-if="$ctrl.showError()"><a ng-click="$ctrl.openUserStatusReportModal()"><span class="badge badge--outline badge--round">{{$ctrl.displayedSummary.error}}</span> <span translate="servicesOverview.userStatusesSummary.inError"></span></a></div>
      <div class="active-card_action" ng-if="$ctrl.showPending()"><a ng-click="$ctrl.openUserStatusReportModal()"><span class="badge badge--outline badge--round">{{$ctrl.displayedSummary.notActivated}}</span> <span translate="servicesOverview.userStatusesSummary.inPending"></span></a></div>
      <div class="active-card_action" ng-if="$ctrl.showActivated()"><a ng-click="$ctrl.openUserStatusReportModal()"><span class="badge badge--outline badge--round">{{$ctrl.displayedSummary.activated}}</span> <span translate="servicesOverview.userStatusesSummary.active"></span></a></div>
    </div>
  `;
  public bindings = {
    summary: '<',
  };
}
