/* @ngInject */
export function telephoneNumberFilter(PhoneNumberService) {
  return filter;

  function filter(number): string {
    if (!number) {
      return '';
    }
    return PhoneNumberService.getNationalFormat(number);
  }
}
