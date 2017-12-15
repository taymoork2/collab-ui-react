import { HybridServiceId } from 'modules/hercules/hybrid-services.types';
import { IExtendedStatusSummary } from 'modules/hercules/services/uss.service';
import { IToolkitModalService } from 'modules/core/modal';

import './card-users-summary.scss';

type SimpleSummary = Pick<IExtendedStatusSummary, 'activated' | 'error' | 'notActivated'>;

class CardUsersSummaryController implements ng.IComponentController {
  public summary: IExtendedStatusSummary;
  public serviceId: HybridServiceId;
  public sum: SimpleSummary = {
    activated: 0,
    error: 0,
    notActivated: 0,
  };
  public state: 'error' | 'pending' | 'activated' | 'noUsers' = 'noUsers';

  /* @ngInject */
  constructor(
    private $modal: IToolkitModalService,
  ) {}

  public $onChanges(changes: { summary: ng.IChangesObject<IExtendedStatusSummary[]> }) {
    if (changes.summary && changes.summary.currentValue) {
      this.sum = _.reduce(changes.summary.currentValue, (acc, summary) => {
        if (!this.serviceId && summary.serviceId && summary.serviceId !== 'squared-fusion-ec') {
          this.serviceId = summary.serviceId;
        }
        return {
          activated: summary.activated + acc.activated,
          error: summary.error + acc.error,
          notActivated: summary.notActivated + acc.notActivated,
        };
      }, {
        activated: 0,
        error: 0,
        notActivated: 0,
      });
      if (this.sum.error > 0) {
        this.state = 'error';
      } else if (this.sum.notActivated > 0) {
        this.state = 'pending';
      } else if (this.sum.activated > 0) {
        this.state = 'activated';
      } else {
        this.state = 'noUsers';
      }
    }
  }

  public openUserStatusReportModal() {
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

  public openEnableUsersModal() {
    this.$modal.open({
      type: 'small',
      template: `<enable-users-modal class="modal-content" service-id="'${this.serviceId}'" dismiss="$dismiss()" close="$close()"></enable-users-modal>`,
    });
  }
}

export class CardUsersSummaryComponent implements ng.IComponentOptions {
  public controller = CardUsersSummaryController;
  public template = `
    <div class="active-card_section">
      <div class="active-card_title" translate="servicesOverview.userStatusesSummary.users"></div>
      <div ng-switch="$ctrl.state">
        <div ng-switch-when="error" class="active-card_action">
          <a href ng-click="$ctrl.openUserStatusReportModal()"><span class="badge badge--outline badge--round">{{$ctrl.sum.error}}</span> <span translate="servicesOverview.userStatusesSummary.inError"></span></a>
        </div>
        <div ng-switch-when="pending" class="active-card_action">
          <a href ng-click="$ctrl.openUserStatusReportModal()"><span class="badge badge--outline badge--round">{{$ctrl.sum.notActivated}}</span> <span translate="servicesOverview.userStatusesSummary.inPending"></span></a>
        </div>
        <div ng-switch-when="activated" class="active-card_action">
          <a href ng-click="$ctrl.openUserStatusReportModal()"><span class="badge badge--outline badge--round">{{$ctrl.sum.activated}}</span> <span translate="servicesOverview.userStatusesSummary.active"></span></a>
        </div>
        <div ng-switch-when="noUsers" class="active-card_action">
          <a href ng-click="$ctrl.openEnableUsersModal()"><span translate="servicesOverview.userStatusesSummary.enableUsers"></span></a>
        </div>
      </div>
    </div>
  `;
  public bindings = {
    summary: '<',
  };
}
