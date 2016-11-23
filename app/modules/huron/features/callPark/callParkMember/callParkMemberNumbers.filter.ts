/**
 * This filter takes an array of Line objects from the Member object
 * and returns the primary number
 * and filters the result to look like:
 * 501 and (707) 731-5745
 * or in the case of no externalNumber:
 * 501
 * @param {$translate} - Translate Service
 * @param {TelephoneNumberService} - Telephone Number service located in modules/huron/telephony/telephoneNumber.service.js
 * @return {string} - The formatted primary number.
 */
import { Line } from 'modules/huron/lines/services';

/* @ngInject */
export function callParkMemberNumbersFilter($translate, TelephoneNumberService) {
  return filter;

  function filter(numbers: Array<Line>, includeExternal: boolean = false): string {
    let number: Line = _.find<Line>(numbers, (item) => {
      return item.primary === true;
    });
    let filteredNumber = _.get(number, 'internal', '');
    let externalNumber = _.get(number, 'external');

    if (includeExternal && externalNumber) {
      filteredNumber += ' ' + $translate.instant('common.and') + ' ' + TelephoneNumberService.getDIDLabel(externalNumber);
    }
    return filteredNumber;
  }
}
