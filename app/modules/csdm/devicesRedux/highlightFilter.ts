import { FieldQuery, SearchElement } from '../services/search/searchElement';
import { SearchObject } from '../services/search/searchObject';

/* @ngInject */
export function highlightFilter($sanitize) {

  return (input, textToHighlight, highlightMask: HighlightMask = new HighlightMask((input || '').length), applyHighlight = true) => {
    if (input && textToHighlight) {

      input.replace(/( (and|or) )/gi, (_match, g1, _g2, offset) => {
        highlightMask.restrictMask(offset, g1.length);
      });
      textToHighlight = $sanitize(textToHighlight);
      const escaped = _.escapeRegExp(textToHighlight);
      _.forEach(_.split(escaped, ' '), (s) => {
        const regex = new RegExp(`(${s})`, 'gi');
        input = input.replace(regex, (_match, g3, offset) => {
          highlightMask.addToMask(offset, g3.length);
          return g3;
        });
      });
      return applyHighlight ? highlightMask.highlight(input) : input;
    }
    return input;
  };
}

/* @ngInject */
export function highlightSearchAndTranslateFilter($translate: any, $sanitize: any) {
  const theFilter = highlightFilter($sanitize);
  const thisFilter = (input: string, searchElement: SearchElement, highlightMask, applyHighlight) => {
    if (searchElement) {
      if (searchElement instanceof FieldQuery) {
        input = theFilter(input, searchElement.field, highlightMask, applyHighlight);
        input = theFilter(input, searchElement.query, highlightMask, applyHighlight);
      } else {
        _.forEach(searchElement.getExpressions(), (element) => {
          input = thisFilter(input, element, highlightMask, false);
        });
        input = highlightMask.highlight(input);
      }
    }
    return input;
  };
  return (translatableInput: string, translateParams: { [key: string]: string } | null, searchObject: SearchObject) => {
    const workingElement = searchObject && searchObject.getWorkingElement();
    if (workingElement) {
      const sanitizedInput = $sanitize(_.escape(translatableInput));
      const highlightMask = new HighlightMask((sanitizedInput || '').length);
      if (translateParams) {
        return $translate.instant(sanitizedInput, _.reduce(translateParams, (result, value, key) => {
          const sanitizedValue = $sanitize(_.escape(value));
          result[key] = thisFilter(sanitizedValue, workingElement, new HighlightMask(sanitizedValue.length), true);
          return result;
        }, {}), undefined, undefined, null);
      } else {
        return thisFilter(sanitizedInput, workingElement, highlightMask, true);
      }
    }
    return $translate.instant(translatableInput, translateParams);
  };
}

class HighlightMask {
  public mask: any[];
  private static highlightMark = '-';
  private static noHighlightMark = ' ';
  private static blockedHiglightMark = 'x';

  constructor(length: number) {
    this.mask = [];
    for (let i = 0; i < length; i++) {
      this.mask.push(HighlightMask.noHighlightMark);
    }
  }

  public addToMask(start, length) {
    for (let i = start; i < (start + length) && i < this.mask.length; i++) {
      if (this.mask[i] === HighlightMask.noHighlightMark) {
        this.mask[i] = HighlightMask.highlightMark;
      }
    }
  }

  public restrictMask(start, length) {
    for (let i = start; i < (start + length) && i < this.mask.length; i++) {
      this.mask[i] = HighlightMask.blockedHiglightMark;
    }
  }

  public highlight(input: string): string {
    if (input.length !== this.mask.length) {
      return input;
    }
    let output = '';
    let highlighting = false;
    for (let i = 0; i < input.length; i++) {
      if (highlighting) {
        if (this.mask[i] !== HighlightMask.highlightMark) {
          output += '</b>';
          highlighting = false;
        }
      } else {
        if (this.mask[i] === HighlightMask.highlightMark) {
          output += '<b>';
          highlighting = true;
        }
      }
      output += input[i];
    }
    if (highlighting) {
      output += '</b>';
    }
    return output;
  }
}

