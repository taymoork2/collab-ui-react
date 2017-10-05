const moment = require('moment');

/**
 * a date filter implementation that uses moment.js.
 * This currently only provides a date-display filter, but could/should be updated to add any other filters based on moment.js.
 * In order to use this, add a filter to any desired date element:
 * <pre>
 *     <span>{{dateValue | 'momentDate : "formatString"'}}</span>
 * </pre>
 * See the moment.js documentation for valid values of 'formatString'.
 *
 * This filter currently only supports valid date strings, and will return an empty string for any unsupported value.
 */
export class Moment {

  public static readonly dateFilterName = 'momentDate';

  public static getDateFilter(formatString: string): string {
    return `${Moment.dateFilterName} : "${formatString}"`;
  }

  public static dateFilter() {
    return (dataTimeValue, formatString): string => {
      if (formatString.trim().length === 0) {
        return Moment.getInvalidDate();
      }
      const dateTime = moment(dataTimeValue);
      if (!dateTime.isValid()) {
        return Moment.getInvalidDate();
      }
      return dateTime.format(formatString);
    };
  }

  private static getInvalidDate() {
    return '';
  }
}

export default angular.module('Context').filter(Moment.dateFilterName, Moment.dateFilter).name;
