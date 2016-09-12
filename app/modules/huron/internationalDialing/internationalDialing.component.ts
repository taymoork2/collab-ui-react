import {
  IOption,
  INT_DIAL_CHANGE,
  InternationalDialingService
} from './index';

class InternationalDialing {
  selected: IOption;

  options: IOption[] = [];
  form: ng.IFormController;
  constructor(private $translate,
    private InternationalDialingService: InternationalDialingService,
    private $scope: ng.IScope) {
    this.options.push(InternationalDialingService.cbUseGlobal);
    this.options.push(InternationalDialingService.cbAlwaysAllow);
    this.options.push(InternationalDialingService.cbNeverAllow);
    this.selected = InternationalDialingService.getInternationalDialing();
  }

  save() {
    this.InternationalDialingService.setInternationalDialing(this.selected);
    this.$scope.$emit(INT_DIAL_CHANGE, this.selected);
    this.form.$setPristine();
  }

  reset() {
    this.form.$setPristine();
  }
}

export class InternationalDialingComponnent implements ng.IComponentOptions {
  public controller = InternationalDialing;
  public templateUrl = 'modules/huron/internationalDialing/internationalDialing.html';
  public bindings: {[binding: string]: string} = {

  }
}
