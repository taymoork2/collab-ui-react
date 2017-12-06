import { FieldQuery, SearchElement } from '../services/search/searchElement';
import { SearchObject } from '../services/search/searchObject';

/* @ngInject */
export function highlightFilter($sanitize) {
  return (input, textToHighlight) => {
    if (input && textToHighlight) {
      input = $sanitize(input);
      textToHighlight = $sanitize(textToHighlight);
      const escaped = _.escapeRegExp(textToHighlight);
      _.forEach(_.split(escaped, ' '), (s) => {
        const regex = new RegExp(`(${s})`, 'gi');
        input = input.replace(regex, '<b>$1</b>');
      });
      return input;
    }
    return input;
  };
}

/* @ngInject */
export function highlightSearchAndTranslateFilter($translate: any, $sanitize: any) {
  const theFilter = highlightFilter($sanitize);
  const thisFilter = (input: string, searchElement: SearchElement) => {
    if (searchElement) {
      if (searchElement instanceof FieldQuery) {
        input = theFilter(input, searchElement.field);
        input = theFilter(input, searchElement.query);
      } else {
        _.forEach(searchElement.getExpressions(), (element) => {
          input = thisFilter(input, element);
        });
      }
    }
    return input;
  };
  return (translatableInput: string, translateParams: { [key: string]: string } | null, searchObject: SearchObject) => {
    const workingElement = searchObject && searchObject.getWorkingElement();

    if (workingElement) {
      if (translateParams) {
        return $translate.instant(translatableInput, _.reduce(translateParams, (result, value, key) => {
          result[key] = thisFilter(value, workingElement);
          return result;
        }, {}), undefined, undefined, null);
      } else {
        return thisFilter(translatableInput, workingElement);
      }
    }
    return $translate.instant(translatableInput, translateParams);
  };
}

