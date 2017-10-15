import { SearchObject } from '../services/search/searchObject';

export function highlightFilter() {
  return function (input, textToHighlight) {
    if (input && textToHighlight) {
      const regex = new RegExp(`(${textToHighlight})`, 'gi');
      return input.replace(regex, '<b>$1</b>');
    }
    return input;
  };
}
export function highlightSearchFilter() {
  return function (input, searchObject: SearchObject, field: string) {
    const seachField = searchObject
      && searchObject.tokenizedQuery
      && (searchObject.tokenizedQuery[field] || searchObject.tokenizedQuery['any']);
    if (input && seachField && seachField.query) {
      const regex = new RegExp(`(${seachField.query})`, 'gi');
      return input.replace(regex, '<span class="hl">$1</span>');
    }
    return input;
  };
}
