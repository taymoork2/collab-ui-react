import { PagingNumberService } from 'modules/huron/features/pagingGroup/pgNumber.service';
import { INumberData } from 'modules/huron/features/pagingGroup/pagingGroup';

class PagingNumberCtrl implements ng.IComponentController {
  public pagingGroupNumber: INumberData;
  public queryString: string;
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
      this.queryString = number.extension;
      this.onUpdate({
        number: number,
        isValid: true,
      });
    }
  }

  public fetchNumbers(): ng.IPromise<INumberData []> {
    return this.PagingNumberService.getNumberSuggestions(this.queryString).then(
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
