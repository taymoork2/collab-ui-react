import { SearchFields, SearchObject } from '../services/csdmSearch.service';
export function highlightFilter() {
  return function (input, searchObject: SearchObject, field: string) {
    const seachField = searchObject
      && searchObject.tokenizedQuery
      && (searchObject.tokenizedQuery[field] || searchObject.tokenizedQuery[SearchFields[SearchFields.any]]);
    if (input && seachField && seachField.query) {
      const regex = new RegExp('(' + seachField.query + ')', 'gi');
      return input.replace(regex, "<span class='hl'>$1</span>");
    }
    return input;
  };
}

