import { DialingService, IOption } from './dialing.service';

class DialingCtrl implements ng.IComponentController {
  public selected: IOption;
  public initialSelection: IOption;
  public watcher: string;
  public options: IOption[] = [];
  public form: ng.IFormController;

  public constructor(
    private $translate,
    private DialingService: DialingService,
    private $scope: ng.IScope) {
    this.initialSelection = _.cloneDeep(this.selected);
    this.options.push(DialingService.cbUseGlobal);
    this.options.push(DialingService.cbAlwaysAllow);
    this.options.push(DialingService.cbNeverAllow);
  }

  public save() {
    this.$scope.$emit(this.watcher, this.selected);
    this.form.$setPristine();
  }

  public reset() {
    this.form.$setPristine();
    this.selected = this.initialSelection;
  }
}

export class DialingComponent implements ng.IComponentOptions {
  public controller = DialingCtrl;
  public templateUrl = 'modules/huron/dialing/dialing.html';
  public bindings = <{ [binding: string]: string }>{
    watcher: '@',
    selected: '@',
  };
}
