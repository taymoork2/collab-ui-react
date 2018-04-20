import { Moment } from './momentFilter';

describe('momentFilter', () => {
  it('should have the correct dateFilter name', function () {
    expect(Moment.dateFilterName).toBe('momentDate');
  });

  it('should create the correct filter string', function () {
    expect(Moment.getDateFilter('DateFormatString')).toBe('momentDate : "DateFormatString"');
  });

  describe('date filter', function () {
    const date = '2017-08-09T21:15:31.627Z';
    const dateFilter = Moment.dateFilter();

    it('should correctly format as "L"', function () {
      expect(dateFilter(date, 'L')).toBe('08/09/2017');
    });

    it('should correctly format as "LL"', function () {
      expect(dateFilter(date, 'LL')).toBe('August 9, 2017');
    });

    it('should return empty string for invalid ISO date string input', function () {
      expect(dateFilter('2017-08-32T21:15:31.627Z', 'LL')).toBe('');
    });
  });
});
