import { SpeedDialService, ISpeedDial } from './speedDial.service';
import { IActionItem } from 'modules/core/components/sectionTitle/sectionTitle.component';
import { Notification } from 'modules/core/notifications';

interface IValidationMessages {
  required: string;
  pattern: string;
}

const SPEED_DIAL_LIMIT = 125;
class SpeedDialCtrl implements ng.IComponentController {
  private ownerId: string;
  private ownerType: string;
  private firstReordering: boolean = true;
  private editing: boolean;
  private reordering: boolean;
  private speedDialList: ISpeedDial[] = [];
  private copyList: ISpeedDial[] | undefined;
  private newLabel: string;
  private newNumber: string;
  private labelMessages: IValidationMessages;
  private numberMessages: IValidationMessages;
  private actionList: IActionItem[];
  private actionListCopy: IActionItem[] = [];

  /* @ngInject */
  constructor(
    private $modal,
    private $translate: ng.translate.ITranslateService,
    private dragularService,
    private Notification: Notification,
    private SpeedDialService: SpeedDialService,
  ) {

    this.SpeedDialService.getSpeedDials(this.ownerType, this.ownerId).then((data) => {
      this.speedDialList = data.speedDials;
    }).catch(() => {
      this.Notification.error('speedDials.retrieveSpeedDialsFail');
    });
    this.labelMessages = {
      required: this.$translate.instant('common.invalidRequired'),
      pattern: this.$translate.instant('speedDials.labelIncorrectCharacter'),
    };
    this.numberMessages = {
      required: this.$translate.instant('common.invalidRequired'),
      pattern: this.$translate.instant('common.incorrectFormat'),
    };

    if (!this.reachSpeedDialLimit()) {
      this.actionListCopy.push({
        actionKey: this.$translate.instant('speedDials.addSpeedDial'),
        actionFunction: this.add.bind(this),
      });
    }
    this.actionListCopy.push({
        actionKey: this.$translate.instant('speedDials.reorder'),
        actionFunction: this.setReorder.bind(this),
      });
    this.actionList = _.cloneDeep(this.actionListCopy);
  }
  public reachSpeedDialLimit() {
    return this.speedDialList.length >= SPEED_DIAL_LIMIT;
  }

  public add(): void {
    let sd = {
      index: this.speedDialList.length + 1,
      label: '',
      number: '',
    };
    this.speedDialList.push(sd);
    this.setEdit(sd);
  }

  public save(): void {
    if (this.editing) {
      let sd = _.find(this.speedDialList, {
        edit: true,
      });
      sd.edit = false;
      sd.label = this.newLabel;
      sd.number = this.newNumber.replace(/ /g, '');
      this.newLabel = '';
      this.newNumber = '';
    } else if (this.reordering) {
      this.updateIndex();
      this.copyList = undefined;
    }
    this.SpeedDialService.updateSpeedDials(this.ownerType, this.ownerId, this.speedDialList).then(() => {
      this.reordering = false;
      this.editing = false;
      this.actionList = _.cloneDeep(this.actionListCopy);
    }, () => {
      this.Notification.error('speedDials.speedDialChangesFailed');
      if (_.has(this, 'id')) {
        this.SpeedDialService.getSpeedDials(this.ownerType, this.ownerId).then((data) => {
          this.speedDialList = data.speedDials;
        }).catch(() => {
          this.Notification.error('speedDials.retrieveSpeedDialsFail');
        });
      }
      this.reordering = false;
      this.editing = false;
      this.actionList = _.cloneDeep(this.actionListCopy);
    });
  }

  public reset(): void {
    if (this.editing) {
      let sd = _.find(this.speedDialList, {
        edit: true,
      });
      if (_.isEmpty(sd.label) || _.isEmpty(sd.number)) {
        //Create case: remove last element
        this.speedDialList.pop();
      } else {
        //Update case: go back to read only mode
        sd.edit = false;
      }
      this.newLabel = '';
      this.newNumber = '';
    } else if (this.reordering) {
      this.speedDialList.length = 0;
      Array.prototype.push.apply(this.speedDialList, angular.copy(this.copyList));
    }
    this.editing = false;
    this.reordering = false;
    this.actionList = _.cloneDeep(this.actionListCopy);
  }

  public setReorder(): void {
    this.reordering = true;
    this.actionList = [];
    this.copyList = angular.copy(this.speedDialList);
    if (this.firstReordering) {
      this.firstReordering = false;
      this.dragularService('#speedDialsContainer', {
        classes: {
          transit: 'sd-reorder-transit',
        },
        containersModel: [this.speedDialList],
        moves: () => {
          return this.reordering;
        },
      });
    }
  }
  public setEdit(sd: ISpeedDial): void {
    this.editing = true;
    sd.edit = true;
    this.newLabel = sd.label;
    this.newNumber = sd.number;
    this.actionList = [];
  }

  public delete(sd): void {
    this.$modal.open({
        templateUrl: 'modules/huron/speedDials/deleteConfirmation.tpl.html',
        type: 'dialog',
      }).result.then(() => {
        _.pull(this.speedDialList, sd);
        this.updateIndex();
        this.SpeedDialService.updateSpeedDials(this.ownerType, this.ownerId, this.speedDialList).then( () => undefined).catch(() => {
          this.Notification.error('speedDials.speedDialChangesFailed');
        });
      });
  }

  private updateIndex(): void {
    _.each(this.speedDialList, (sd, index) => {
      sd.index = index + 1;
    });
  }
}

export class SpeedDialComponent implements ng.IComponentOptions {
  public controller = SpeedDialCtrl;
  public templateUrl = 'modules/huron/speedDials/speedDials.html';
  public bindings = {
    ownerId: '<',
    ownerType: '@',
  };
}
