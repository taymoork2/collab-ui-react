'use strict';

describe('PagerUtil', function () {
  beforeEach(module('wx2AdminWebClientApp'));

  var PagerUtil;

  beforeEach(inject(function (_PagerUtil_) {
    PagerUtil = _PagerUtil_;
  }));

  it('should return correct pageCount when pageSize fits resultSize', function () {
    var pager = new PagerUtil({
      resultSize: 10,
      pageSize: 5
    });
    expect(pager.pageCount).toBe(2);
    expect(pager.currentPage).toBe(1);
    expect(pager.currentPageSize).toBe(5);
    expect(pager.next).toBe(true);
    expect(pager.prev).toBe(false);

    pager.nextPage();
    expect(pager.pageCount).toBe(2);
    expect(pager.currentPage).toBe(2);
    expect(pager.currentPageSize).toBe(5);
    expect(pager.next).toBe(false);
    expect(pager.prev).toBe(true);

    pager.prevPage();
    expect(pager.pageCount).toBe(2);
    expect(pager.currentPage).toBe(1);
    expect(pager.currentPageSize).toBe(5);
    expect(pager.next).toBe(true);
    expect(pager.prev).toBe(false);
  });

  it('should return correct pageCount when pageSize doesnt fit resultSize', function () {
    var pager = new PagerUtil({
      resultSize: 13,
      pageSize: 5
    });
    expect(pager.pageCount).toBe(2);
    expect(pager.currentPage).toBe(1);
    expect(pager.currentPageSize).toBe(5);
    expect(pager.next).toBe(true);
    expect(pager.prev).toBe(false);

    pager.nextPage();
    expect(pager.pageCount).toBe(2);
    expect(pager.currentPage).toBe(2);
    expect(pager.currentPageSize).toBe(8);
    expect(pager.next).toBe(false);
    expect(pager.prev).toBe(true);

    pager.prevPage();
    expect(pager.pageCount).toBe(2);
    expect(pager.currentPage).toBe(1);
    expect(pager.currentPageSize).toBe(5);
    expect(pager.next).toBe(true);
    expect(pager.prev).toBe(false);
  });

  it('last page should contain the last items that didnt fit on the page', function () {
    var pager = new PagerUtil({
      resultSize: 9,
      pageSize: 5
    });
    expect(pager.pageCount).toBe(1);
    expect(pager.currentPage).toBe(1);
    expect(pager.currentPageSize).toBe(9);
    expect(pager.next).toBe(false);
    expect(pager.prev).toBe(false);
    pager.nextPage();
    pager.prevPage();
  });

  it('should handle empty resultset', function () {
    var pager = new PagerUtil({
      resultSize: 0,
      pageSize: 5
    });
    expect(pager.pageCount).toBe(0);
    expect(pager.currentPage).toBe(0);
    expect(pager.currentPageSize).toBe(5);

    pager.update({
      resultSize: 12
    });
    expect(pager.pageCount).toBe(2);
    expect(pager.currentPage).toBe(1);
    expect(pager.currentPageSize).toBe(5);
  });

  it('should handle small resultset', function () {
    var pager = new PagerUtil({
      resultSize: 2,
      pageSize: 5
    });
    expect(pager.pageCount).toBe(1);
    expect(pager.currentPage).toBe(1);
    expect(pager.currentPageSize).toBe(2);
  });

});
