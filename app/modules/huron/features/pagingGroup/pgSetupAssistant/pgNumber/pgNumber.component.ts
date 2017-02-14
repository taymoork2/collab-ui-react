import { PagingNumberService } from 'modules/huron/features/pagingGroup/pgNumber.service';

class PagingNumberCtrl implements ng.IComponentController {
  public pagingGroupNumber: string;
  public errorNumberInput: boolean = false;
  private onUpdate: Function;

  /* @ngInject */
  constructor(
    private PagingNumberService: PagingNumberService,
    private Notification,
  ) {}

  public selectNumber(number: string): void {
    if (number) {
      this.pagingGroupNumber = number;
      this.onUpdate({
        number: number,
        isValid: true,
      });
    }
  }

  public fetchNumbers(): ng.IPromise<String []> {
    return this.PagingNumberService.getNumberSuggestions(this.pagingGroupNumber).then(
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
  public templateUrl = 'modules/huron/features/pagingGroup/pgSetupAssistant/pgNumber/pgNumber.html';
  public bindings = {
    onUpdate: '&',
    pagingGroupNumber: '<',
  };
}
