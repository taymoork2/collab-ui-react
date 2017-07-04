import { SearchFields, SearchObject } from '../services/csdmSearch.service';
export function highlightFilter() {
  return function (input, searchObject: SearchObject, field: string) {
    const seachField = searchObject
      && searchObject.tokenizedQuery
      && (searchObject.tokenizedQuery[field] || searchObject.tokenizedQuery[SearchFields[SearchFields.any]]);
    if (input && seachField) {
      const regex = new RegExp('(' + seachField + ')', 'gi');
      return input.replace(regex, "<span class='hl'>$1</span>");
    }
    return input;
  };
}

