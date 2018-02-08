import { HybridServiceId } from 'modules/hercules/hybrid-services.types';
import { IExtendedStatusSummary } from 'modules/hercules/services/uss.service';
import { IToolkitModalService } from 'modules/core/modal';

type SimpleSummary = Pick<IExtendedStatusSummary, 'activated' | 'error' | 'notActivated' | 'total'>;

class CardUsersSummaryController implements ng.IComponentController {
  public serviceId: HybridServiceId;
  public sum: SimpleSummary = {
    activated: 0,
    error: 0,
    notActivated: 0,
    total: 0,
  };
  public state: 'error' | 'pending' | 'activated' | 'noUsers' = 'noUsers';

  /* @ngInject */
  constructor(
    private $modal: IToolkitModalService,
    private $state: ng.ui.IStateService,
  ) {}

  public $onChanges(changes: { summary: ng.IChangesObject<IExtendedStatusSummary[]> }) {
    if (changes.summary && changes.summary.currentValue) {
      this.sum = _.reduce(changes.summary.currentValue, (acc, summary) => {
        // "Hijack" the reduce function to set which serviceId is relevant in this context
        if (!this.serviceId && summary.serviceId && summary.serviceId !== 'squared-fusion-ec') {
          this.serviceId = summary.serviceId;
        }

        return {
          activated: summary.activated + acc.activated,
          error: summary.error + acc.error,
          notActivated: summary.notActivated + acc.notActivated,
          total: summary.total + acc.total,
        };
      }, {
        activated: 0,
        error: 0,
        notActivated: 0,
        total: 0,
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

  public openUserStatusTab(): void {
    if (this.serviceId === 'squared-fusion-cal') {
      this.$state.go('calendar-service.users');
    } else if (this.serviceId === 'squared-fusion-uc') {
      this.$state.go('call-service.users');
    } else if (this.serviceId === 'spark-hybrid-impinterop') {
      this.$state.go('imp-service.users');
    }
  }

  public openEnableUsersModal(): void {
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
      <p ng-if="$ctrl.sum.total > 0"><a href ng-click="$ctrl.openUserStatusTab()" translate="servicesOverview.userStatusesSummary.assigned" translate-value-total="{{$ctrl.sum.total}}" translate-interpolation="messageformat"></a></p>
      <div ng-switch="$ctrl.state">
        <div ng-switch-when="error" class="active-card_action">
          <span class="badge badge--outline badge--round">{{$ctrl.sum.error}}</span> <span translate="servicesOverview.userStatusesSummary.inError"></span>
        </div>
        <div ng-switch-when="pending" class="active-card_action">
          <span class="badge badge--outline badge--round">{{$ctrl.sum.notActivated}}</span> <span translate="servicesOverview.userStatusesSummary.inPending"></span>
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
