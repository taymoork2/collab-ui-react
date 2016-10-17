import { IPagingGroup } from '../pagingGroup';
import { INumber } from '../pgNumber.service';
import { PagingGroupService } from '../pagingGroup.service';

interface IToolkitModalSettings extends ng.ui.bootstrap.IModalSettings {
  type: string;
}

interface IToolkitModalService extends ng.ui.bootstrap.IModalService {
  open(options: IToolkitModalSettings): ng.ui.bootstrap.IModalServiceInstance;
}

class PgSetupAssistantCtrl implements ng.IComponentController {

  //Paging group name
  public name: string = '';
  private isNameValid: boolean = false;

  //Paging group number
  public number: INumber;
  private isNumberValid: boolean = false;

  public animation: string = 'slide-left';
  private index: number = 0;
  private createLabel: string = '';

  /* @ngInject */
  constructor(private $timeout: ng.ITimeoutService,
              private $modal: IToolkitModalService,
              private $element: ng.IRootElementService,
              private $state: ng.ui.IStateService,
              private $translate: ng.translate.ITranslateService,
              private PagingGroupService: PagingGroupService) {
    this.createLabel = this.$translate.instant('pagingGroup.createHelpText');
  }

  public get lastIndex(): number {
    return 1;
  }

  public getPageIndex(): number {
    return this.index;
  }

  public previousButton(): any {
    if (this.index === 0) {
      return 'hidden';
    }
    return true;
  }

  public nextButton(): any {
    switch (this.index) {
      case 0:
        return this.name !== '' && this.isNameValid;
      case 1:
        let numberDefined: boolean = !(this.number === undefined) && this.isNumberValid;
        let helpText = this.$element.find('div.btn-helptext.helptext-btn--right');
        if (numberDefined) {
          //Show helpText
          helpText.addClass('active');
          helpText.addClass('enabled');
        } else {
          //Hide helpText
          helpText.removeClass('active');
          helpText.removeClass('enabled');
        }
        return numberDefined;
      default:
        return true;
    }
  }

  public previousPage(): void {
    this.animation = 'slide-right';
    this.$timeout(() => {
      if (this.index === this.lastIndex) {
        //Change the green arrow button to a blue one
        let arrowButton = this.$element.find('button.btn--circle.btn--primary.btn--right');
        arrowButton.removeClass('savePagingGroup');
        //Hide helpText
        let helpText = this.$element.find('div.btn-helptext.helptext-btn--right');
        helpText.removeClass('active');
        helpText.removeClass('enabled');
      }
      this.index--;
    });
  }

  public nextPage(): void {
    this.animation = 'slide-left';
    this.$timeout(() => {
      this.index++;
      if (this.index === this.lastIndex) {
        //Change the blue arrow button to a green one
        let arrowButton = this.$element.find('button.btn--circle.btn--primary.btn--right');
        arrowButton.addClass('savePagingGroup');
      }
      if (this.index === this.lastIndex + 1) {
        this.savePagingGroup();
      }
    });
  }

  public nextText(): string {
    return this.createLabel;
  }

  public evalKeyPress(keyCode: number): void {
    const ESCAPE_KEY = 27;
    const LEFT_ARROW = 37;
    const RIGHT_ARROW = 39;
    switch (keyCode) {
      case ESCAPE_KEY:
        this.cancelModal();
        break;
      case RIGHT_ARROW:
        if (this.nextButton() === true) {
          this.nextPage();
        }
        break;
      case LEFT_ARROW:
        if (this.previousButton() === true) {
          this.previousPage();
        }
        break;
      default:
        break;
    }
  }

  public onUpdateName(name: string, isValid: boolean): void {
    this.name = name;
    this.isNameValid = isValid;
  }

  public onUpdateNumber(number: INumber, isValid: boolean): void {
    this.number = number;
    this.isNumberValid = isValid;
  }

  public savePagingGroup(): void {
    let pg: IPagingGroup = <IPagingGroup>{
      name: this.name,
      number: this.number,
      uuid: this.name, //TODO: will hook up with real uuid
    };
    this.PagingGroupService.savePagingGroup(pg);
    this.$state.go('huronfeatures');
  }

  public cancelModal(): void {
    this.$modal.open({
      templateUrl: 'modules/huron/features/pagingGroup/pgSetupAssistant/pgCancelModal.tpl.html',
      type: 'dialog',
    });
  }
}

export class PgSetupAssistantComponent implements ng.IComponentOptions {
  public controller = PgSetupAssistantCtrl;
  public templateUrl = 'modules/huron/features/pagingGroup/pgSetupAssistant/pgSetupAssistant.html';
}
