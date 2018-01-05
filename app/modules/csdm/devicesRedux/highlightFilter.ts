import { FieldQuery, SearchElement } from '../services/search/searchElement';
import _ = require('lodash');
/* @ngInject */
export function highlightFilter($sanitize) {

  return (input: string, textToHighlight: string | undefined, limitToStartsWith: boolean = false, highlightMask: HighlightMask = new HighlightMask((input || '')), applyHighlight = true) => {
    if (input && textToHighlight) {

      input.replace(/( (and|or) )/gi, (match, g1, _g2, offset) => {
        highlightMask.restrictMask(offset, g1.length);
        return match;
      });
      textToHighlight = $sanitize(textToHighlight);
      const escaped = _.escapeRegExp(textToHighlight);
      _.forEach(_.split(escaped, ' '), (s) => {
        const regex = new RegExp(`${limitToStartsWith ? '^' : ''}(${s})`, 'gi');
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
export function highlightAndTranslate($translate, $sanitize) {
  const theFilter = highlightFilter($sanitize);
  const thisFilter = (input: string, searchElement: SearchElement | null, highlightMask: HighlightMask, applyHighlight): string => {
    if (searchElement) {
      if (searchElement instanceof FieldQuery) {
        input = theFilter(input, searchElement.field, false, highlightMask, false);
        input = theFilter(input, searchElement.query, false, highlightMask, applyHighlight);
      } else {
        _.forEach(searchElement.getExpressions(), (element) => {
          input = thisFilter(input, element, highlightMask, false);
        });
        input = highlightMask.highlight(input);
      }
    }
    return input;
  };

  return (textNoneTranslatable: string, textTranslationKey: string | null, textTranslationParams: { [key: string]: string } | null, workingElement: SearchElement | null): string => {
    const sanitizedInput = $sanitize(_.escape(textTranslationParams && textTranslationKey || textNoneTranslatable));
    const highlightMask = new HighlightMask(sanitizedInput);
    if (workingElement) {
      if (textTranslationKey && textTranslationParams) {
        return $translate.instant(sanitizedInput, _.reduce(textTranslationParams, (result, value, key) => {
          const sanitizedValue = $sanitize(_.escape(value));
          const innerHighlightMask = new HighlightMask(sanitizedValue);
          result[key] = thisFilter(sanitizedValue, workingElement, innerHighlightMask, true);
          return result;
        }, {}), undefined, undefined, null);
      } else {
        return thisFilter(sanitizedInput, workingElement, highlightMask, true);
      }
    }
    if (textTranslationKey && textTranslationParams) {
      return thisFilter($translate.instant(textTranslationKey, textTranslationParams), null, highlightMask, true);
    }
    return thisFilter(sanitizedInput, null, highlightMask, true);
  };
}

export class HighlightMask {
  private mask: any[];
  private static highlightMark = '-';
  private static noHighlightMark = ' ';
  private static blockedHighlightMark = 'x';
  private maskHasBeenUpdated: boolean;

  constructor(input: string | undefined) {
    input = input || '';
    const length = input.length;
    this.mask = [];
    for (let i = 0; i < length; i++) {
      this.mask.push(HighlightMask.noHighlightMark);
    }
  }

  public addToMask(start, length) {
    for (let i = start; i < (start + length) && i < this.mask.length; i++) {
      if (this.mask[i] === HighlightMask.noHighlightMark) {
        this.mask[i] = HighlightMask.highlightMark;
        this.maskHasBeenUpdated = true;
      } else if (this.mask[i] === HighlightMask.highlightMark) {
        this.maskHasBeenUpdated = true;
      }
    }
  }

  public restrictMask(start, length) {
    for (let i = start; i < (start + length) && i < this.mask.length; i++) {
      this.mask[i] = HighlightMask.blockedHighlightMark;
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

