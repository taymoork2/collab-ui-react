interface ICheckboxSelection {
  isSelected: boolean;
}

interface ICheckboxSelections {
  [key: string]: ICheckboxSelection;
}

export class JabberToWebexTeamsPrerequisitesModalController implements ng.IComponentController {
  public dismiss: Function;
  private preReqs: ICheckboxSelections;
  private numPreReqs: number | undefined;

  /* @ngInject */
  constructor(
    private $element: ng.IRootElementService,
    private Analytics,
  ) {}

  public $onInit(): void {
    // TODO (mipark2, spark-14176): may need to restore selections instead of re-initializing
    this.preReqs = {};
  }

  public $postLink(): void {
    this.updateNumPreReqs();
  }

  private updateNumPreReqs(): void {
    const CR_CHECKBOX_ITEM = 'cr-checkbox-item';
    this.numPreReqs = this.$element.find(CR_CHECKBOX_ITEM).length;
  }

  public dismissModal(): void {
    this.Analytics.trackAddUsers(this.Analytics.eventNames.CANCEL_MODAL);
    this.dismiss();
  }

  public get hasPrereqs(): boolean {
    if (_.isUndefined(this.numPreReqs) || _.size(this.preReqs) !== this.numPreReqs) {
      return false;
    }
    return _.every(this.preReqs, { isSelected: true });
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

  private next(): void {
    // TODO (spark-14176): transition to add-a-profile step
  }

  private finish(): void {
    // TODO (spark-14176): dismiss modal + notify success/error
  }
}

export class JabberToWebexTeamsPrerequisitesModalComponent implements ng.IComponentOptions {
  public controller = JabberToWebexTeamsPrerequisitesModalController;
  public template = require('./jabber-to-webex-teams-prerequisites-modal.html');
  public bindings = {
    dismiss: '&',
  };
}
