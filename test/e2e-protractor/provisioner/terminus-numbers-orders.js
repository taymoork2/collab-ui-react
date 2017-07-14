export class PstnNumbersOrders {
  constructor(obj = {
    createdBy: undefined,
    numberType: undefined,
    numbers: undefined,
  }) {
    this.createdBy = obj.createdBy || 'partner';
    this.numberType = obj.numberType || 'did';
    this.numbers = obj.numbers;
  }
}
