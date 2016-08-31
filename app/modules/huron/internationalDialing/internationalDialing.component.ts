import { IOption, INT_DIAL_CHANGE } from './internationalDialing';
import { InternationalDialingService } from './internationalDialing.service'

class InternationalDialingCtrl {
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
  private $onInit(): void {
    
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

class InternationalDialingComponnent implements ng.IComponentOptions {
  public controller = InternationalDialingCtrl;
  public templateUrl = 'modules/huron/internationalDialing/internationalDialing.html';
  public bindings: {[binding: string]: string} = {
    
  }
}

export default angular
  .module('huron.international-dialing', [
    'atlas.templates',
    'cisco.ui',
    'pascalprecht.translate',
    'Squared'
  ])
  .component('internationalDialingComp', new InternationalDialingComponnent())
  .name;
