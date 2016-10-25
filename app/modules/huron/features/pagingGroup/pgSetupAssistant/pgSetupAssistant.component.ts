import { IPagingGroup } from 'modules/huron/features/pagingGroup/pagingGroup';
import { PagingGroupService } from 'modules/huron/features/pagingGroup/pagingGroup.service';

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
  public number: string;
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
              private PagingGroupService: PagingGroupService,
              private Notification) {
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
        let numberDefined: boolean = this.number !== '' && this.isNumberValid;
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
        this.index--;
      }
    });
  }

  public nextText(): string {
    return this.createLabel;
  }

  public evalKeyPress(keyCode: number): void {
    const ENTER_KEY = 13;
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
      case ENTER_KEY:
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

  public onUpdateNumber(number: string, isValid: boolean): void {
    this.number = number;
    this.isNumberValid = isValid;
  }

  public savePagingGroup(): void {
    let pg: IPagingGroup = <IPagingGroup>{
      name: this.name,
      extension: this.number,
    };
    this.PagingGroupService.savePagingGroup(pg).then(
      (data) => {
        this.Notification.success('pagingGroup.successSave', { pagingGroupName: data.name });
        this.$state.go('huronfeatures');
      },
      (error) => {
        let message = '';
        if (error && _.has(error, 'data')
          && _.has(error.data, 'error')
          && _.has(error.data.error, 'message')
          && _.has(error.data.error.message, 'length')
          && error.data.error.message.length > 0
          && _.has(error.data.error.message[0], 'description')) {
          message = error.data.error.message[0].description;
        }
        this.Notification.error('pagingGroup.errorSave', { message: message });
      });
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
