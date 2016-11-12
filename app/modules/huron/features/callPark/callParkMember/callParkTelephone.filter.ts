import { Line } from 'modules/huron/lines/services';

/* @ngInject */
export function callParkMemberTelephoneFilter() {
  return filter;

  function filter(numbers: Array<Line>): string {
    let number: Line = _.find<Line>(numbers, (item) => {
      return item.primary === true;
    });

    if (number) {
      return number.internal;
    }
    return '';
  }
}
