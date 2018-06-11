import { PrimaryLineService } from './primaryLine.service';
import { IPrimaryLineFeature } from './primaryLine.interfaces';
import { Notification } from 'modules/core/notifications';

class PrimaryLine implements ng.IComponentController {
  public lineSelection: IPrimaryLineFeature;
  public ownerId: string | '';
  public lineSelectionCopy: IPrimaryLineFeature;
  public onChangeFn: Function;
  public isLineSelectionChanged: boolean = false;
  public noneOption: IPrimaryLineFeature;
  public optionSelected: boolean;
  /* @ngInject */
  constructor(
    private Notification: Notification,
    private PrimaryLineService: PrimaryLineService,
    private $scope: ng.IScope,
  ) {
    this.optionSelected = this.lineSelection.primaryLineEnabled;
    this.lineSelectionCopy = this.lineSelection;
    this.noneOption = {
      primaryLineEnabled: false,
      module: 'user',
    };
  }
  public onLineSelectionChange(): void {
    this.lineSelection.primaryLineEnabled = this.optionSelected;
    this.isLineSelectionChanged = true;
  }
  public $onChanges(changes: { [bindings: string]: ng.IChangesObject<any> }): void {
    const {
      lineSelection,
    } = changes;
    if (lineSelection) {
      if (lineSelection.currentValue) {
        this.optionSelected = lineSelection.currentValue;
      } else {
        this.optionSelected = false;
      }
    }
  }

  public onSave() {
    this.PrimaryLineService.update(this.ownerId, this.lineSelection).then(() => {
      this.Notification.success('primaryLine.saveSuccess');
      this.lineSelectionCopy = this.lineSelection;
      this.$scope.$emit('PRIMARY_LINE_SELECTION_CHANGE', this.lineSelection.primaryLineEnabled);
    })
      .catch((response) => {
        this.Notification.errorResponse(response, 'primaryLine.failedToSaveChanges');
      })
      .finally(() => {
        this.isLineSelectionChanged = false;
      });
  }

  public onCancel(): void {
    this.lineSelection = this.lineSelectionCopy;
    this.optionSelected = this.lineSelectionCopy.primaryLineEnabled;
    this.isLineSelectionChanged = false;
  }
}

export class PrimaryLineComponent implements ng.IComponentOptions {
  public controller = PrimaryLine;
  public template = require('modules/huron/primaryLine/primaryLine.html');
  public bindings = {
    ownerId: '=',
    lineSelection: '=',
  };
}
