import { IStatusSummary } from 'modules/hercules/services/uss.service';

import './card-users-summary.scss';

class CardUsersSummaryController implements ng.IComponentController {
  public summary: IStatusSummary;

  public showError() {
    return this.summary.error > 0;
  }

  public showPending() {
    return !this.showError() && this.summary.notActivated > 0;
  }

  public showActivated() {
    return !this.showError() && !this.showPending();
  }
}

export class CardUsersSummaryComponent implements ng.IComponentOptions {
  public controller = CardUsersSummaryController;
  public template = `
    <p><span>Users</span></p>
    <p ng-if="$ctrl.showError()"><a ui-sref="{{$ctrl.link}}"><span class="badge badge--outline badge--round alert">{{$ctrl.summary.error}}</span> users in error</a></p>
    <p ng-if="$ctrl.showPending()"><a ui-sref="{{$ctrl.link}}"><span class="badge badge--outline badge--round warning">{{$ctrl.summary.notActivated}}</span> users in pending activation</a></p>
    <p ng-if="$ctrl.showActivated()"><a ui-sref="{{$ctrl.link}}"><span class="badge badge--outline badge--round">{{$ctrl.summary.activated}}</span> users active</a></p>
  `;
  public bindings = {
    link: '<',
    summary: '<',
  };
}
