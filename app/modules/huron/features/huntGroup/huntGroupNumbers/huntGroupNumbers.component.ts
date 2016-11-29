import { HuntGroupNumber } from 'modules/huron/features/huntGroup/services';
import { NumberService, INumber } from 'modules/huron/numbers';

class HuntGroupNumbersCtrl implements ng.IComponentController {
  public numbers: Array<HuntGroupNumber>;
  public isNew: boolean;
  public onChangeFn: Function;
  public onKeyPressFn: Function;
  public selectedNumber: INumber | undefined;
  public errorNumberInput: boolean = false;

  /* @ngInject */
  constructor(
    private NumberService: NumberService,
  ) {}

  public getNumberList(value: string): ng.IPromise<Array<INumber>> {
    return this.NumberService.getNumberList(value, undefined, false).then( numbers => {
      let filteredNumbers = _.filter(numbers, (number) => {
        return this.isNewNumber(number.uuid);
      });
      if (filteredNumbers.length === 0) {
        this.errorNumberInput = true;
      } else {
        this.errorNumberInput = false;
      }
      return filteredNumbers;
    });
  }

  public selectNumber(number: INumber): void {
    this.selectedNumber = undefined;
    this.numbers.unshift(new HuntGroupNumber({
      uuid: number.uuid,
      type: number.type,
      number: number.number,
    }));
  }

  public removeNumber(number: HuntGroupNumber): void {
    _.remove<HuntGroupNumber>(this.numbers, (huntGroupNumber) => {
      return huntGroupNumber.uuid === number.uuid;
    });
    this.onNumbersChanged(this.numbers);
  }

  public onNumbersChanged(numbers: Array<HuntGroupNumber>): void {
    this.onChangeFn({
      numbers: _.cloneDeep(numbers),
    });
  }

  private isNewNumber(uuid: string): boolean {
    let existingNumbers = _.find(this.numbers, (number) => {
      return number.uuid === uuid;
    });
    return _.isUndefined(existingNumbers);
  }

  public onHandleKeyPress($keyCode): void {
    this.onKeyPressFn({
      keyCode: $keyCode,
    });
  }
}

export class HuntGroupNumbersComponent implements ng.IComponentOptions {
  public controller = HuntGroupNumbersCtrl;
  public templateUrl = 'modules/huron/features/huntGroup/huntGroupNumbers/huntGroupNumbers.html';
  public bindings = {
    numbers: '<',
    isNew: '<',
    onChangeFn: '&',
    onKeyPressFn: '&',
  };
}
