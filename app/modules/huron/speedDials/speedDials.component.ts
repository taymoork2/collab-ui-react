import { SpeedDialService, ISpeedDial } from './speedDial.service';

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
  private copyList: ISpeedDial[];
  private newLabel: string;
  private newNumber: string;
  private labelMessages: IValidationMessages;
  private numberMessages: IValidationMessages;

  constructor(private $translate: ng.translate.ITranslateService,
              private dragularService,
              private Notification,
              private SpeedDialService: SpeedDialService,
              private $modal) {

    SpeedDialService.getSpeedDials(this.ownerType, this.ownerId).then((data) => {
      this.speedDialList = data.speedDials;
    }, () => {
      this.Notification.error('speedDials.retrieveSpeedDialsFail');
    });
    this.labelMessages = {
      required: $translate.instant('common.invalidRequired'),
      pattern: $translate.instant('speedDials.labelIncorrectCharacter'),
    };
    this.numberMessages = {
      required: $translate.instant('common.invalidRequired'),
      pattern: $translate.instant('common.incorrectFormat'),
    };
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
    }, () => {
      this.Notification.error('speedDials.speedDialChangesFailed');
      if (_.has(this, 'id')) {
        this.SpeedDialService.getSpeedDials(this.ownerType, this.ownerId).then((data) => {
          this.speedDialList = data.speedDials;
        }, () => {
          this.Notification.error('speedDials.retrieveSpeedDialsFail');
        });
      }
      this.reordering = false;
      this.editing = false;
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
  }

  public setReorder(): void {
    this.reordering = true;
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
  }

  public delete(sd): void {
    this.$modal.open({
        templateUrl: 'modules/huron/speedDials/deleteConfirmation.tpl.html',
        type: 'dialog',
      }).result.then(() => {
        this.speedDialList.splice(sd.index - 1, 1);
        this.updateIndex();
        this.SpeedDialService.updateSpeedDials(this.ownerType, this.ownerId, this.speedDialList).then( () => undefined, () => {
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
  public bindings: { [binding: string]: string } = {
    ownerId: '@',
    ownerType: '@',
  };
}
