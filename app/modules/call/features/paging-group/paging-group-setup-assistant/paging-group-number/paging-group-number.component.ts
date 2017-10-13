import { PagingNumberService, INumberData } from 'modules/call/features/paging-group/shared';

class PagingNumberCtrl implements ng.IComponentController {
  public pagingGroupNumber: INumberData;
  public errorNumberInput: boolean = false;
  private onUpdate: Function;

  /* @ngInject */
  constructor(
    private PagingNumberService: PagingNumberService,
    private Notification,
  ) {}

  public selectNumber(number: INumberData): void {
    if (number) {
      this.pagingGroupNumber = number;
      this.onUpdate({
        number: number,
        isValid: true,
      });
    }
  }

  public fetchNumbers(): ng.IPromise<INumberData []> {
    return this.PagingNumberService.getNumberSuggestions(this.pagingGroupNumber.extension).then(
      numberList => {
        this.errorNumberInput = (numberList && numberList.length === 0);
        this.onUpdate({
          number: this.pagingGroupNumber,
          isValid: false,
        });
        return numberList;
      }, (response) => {
      this.Notification.errorResponse(response, 'pagingGroup.numberFetchFailure');
      return [];
    });
  }
}

export class PgNumberComponent implements ng.IComponentOptions {
  public controller = PagingNumberCtrl;
  public template = require('modules/call/features/paging-group/paging-group-setup-assistant/paging-group-number/paging-group-number.component.html');
  public bindings = {
    onUpdate: '&',
    pagingGroupNumber: '<',
  };
}
