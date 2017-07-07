import { HuntGroupNumber } from 'modules/call/features/hunt-group';
import { NumberService, INumber } from 'modules/huron/numbers';

const NUMBER_FORMAT_ENTERPRISE_LINE = 'NUMBER_FORMAT_ENTERPRISE_LINE';
class HuntGroupNumbersCtrl implements ng.IComponentController {
  public numbers: HuntGroupNumber[];
  public isNew: boolean;
  public onChangeFn: Function;
  public onKeyPressFn: Function;
  public selectedNumber: INumber | undefined;
  public errorNumberInput: boolean = false;

  /* @ngInject */
  constructor(
    private NumberService: NumberService,
  ) {}

  public getNumberList(value: string): ng.IPromise<INumber[]> {
    return this.NumberService.getNumberList(value, undefined, false).then( numbers => {
      const filteredNumbers = _.filter(numbers, (number) => {
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
    this.onNumbersChanged(this.numbers);
  }

  public removeNumber(hgnumber: HuntGroupNumber): void {
    _.remove<HuntGroupNumber>(this.numbers, (huntGroupNumber) => {
      return (huntGroupNumber.number === hgnumber.number || (huntGroupNumber.type.toString() === NUMBER_FORMAT_ENTERPRISE_LINE && huntGroupNumber.number.slice(hgnumber.number.length) === hgnumber.number));
    });
    this.onNumbersChanged(this.numbers);
  }

  public onNumbersChanged(numbers: HuntGroupNumber[]): void {
    this.onChangeFn({
      numbers: _.cloneDeep(numbers),
    });
  }

  private isNewNumber(uuid: string): boolean {
    const existingNumbers = _.find(this.numbers, (number) => {
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
  public templateUrl = 'modules/call/features/hunt-group/hunt-group-numbers/hunt-group-numbers.component.html';
  public bindings = {
    numbers: '<',
    isNew: '<',
    onChangeFn: '&',
    onKeyPressFn: '&',
  };
}
