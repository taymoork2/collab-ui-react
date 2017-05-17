/**
 * This filter takes a Line object, extracts the internal number.
 * If includeExternal = true then the external number will be formatted
 * to national format and returned:
 * 501 and (707) 731-5745
 * or in the case of no externalNumber:
 * 501
 *
 * @export
 * @param {any} $translate - Translate Service
 * @param {any} PhoneNumberService - Telephone Number service located in modules/huron/telephony/telephoneNumber.service.js
 * @returns {string} - The formatted number.
 */
import { Line } from 'modules/huron/lines/services';

/* @ngInject */
export function callFeatureMemberNumberFormatterFilter($translate, PhoneNumberService) {
  return filter;

  function filter(number: Line, includeExternal: boolean = false): string {
    let formattedNumber = _.get(number, 'internal', '');
    let externalNumber = _.get(number, 'external');

    if (includeExternal && externalNumber) {
      formattedNumber += ' ' + $translate.instant('common.and') + ' ' + PhoneNumberService.getNationalFormat(externalNumber);
    }
    return formattedNumber;
  }
}
