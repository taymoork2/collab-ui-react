import { Notification } from 'modules/core/notifications';

interface ICheckboxSelection {
  isSelected: boolean;
}

interface ICheckboxSelections {
  [key: string]: ICheckboxSelection;
}

export class JabberToWebexTeamsPrerequisitesModalController implements ng.IComponentController {
  public dismiss: Function;
  private preReqs: ICheckboxSelections;
  public readonly preReqIds = {
    VOICE_SERVICE: 'voice-service-domain-prereq',
    DNS_SRV_RECORDS: 'dns-srv-records-prereq',
  };

  /* @ngInject */
  constructor(
    private $state: ng.ui.IStateService,
    private Analytics,
    private Notification: Notification,
  ) {}

  public $onInit(): void {
    // TODO (mipark2, spark-14176): may need to restore selections instead of re-initializing
    this.preReqs = {};
  }

  public dismissModal(): void {
    this.Analytics.trackAddUsers(this.Analytics.eventNames.CANCEL_MODAL);
    this.dismiss();
  }

  public get hasPrereqs(): boolean {
    return (_.size(this.preReqs) === _.size(this.preReqIds)) && _.every(this.preReqs, { isSelected: true });
  }

  public nextOrFinish(): void {
    if (!this.hasPrereqs) {
      this.next();
    } else {
      this.finish();
    }
  }

  public recvUpdate($event: {
    itemId: string;
    item: ICheckboxSelection;
  }): void {
    const itemId = $event.itemId;
    const item = $event.item;
    _.set(this.preReqs, itemId, item);
  }

  public next(): void {
    this.$state.go('jabber-to-webex-teams.modal.add-profile');
  }

  public finish(): void {
    // TODO (spark-14176): revisit - confirm copy to use for success notification
    this.Notification.success('common.notAvailable');
    this.dismiss();
  }
}

export class JabberToWebexTeamsPrerequisitesModalComponent implements ng.IComponentOptions {
  public controller = JabberToWebexTeamsPrerequisitesModalController;
  public template = require('./jabber-to-webex-teams-prerequisites-modal.html');
  public bindings = {
    dismiss: '&',
  };
}
