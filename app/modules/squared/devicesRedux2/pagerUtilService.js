'use strict';

function PagerUtil() {
  return function (opts) {

    this.defaultPageSize = opts.pageSize;

    this.update = function (opts) {
      opts = opts || {};
      this.pageSize = opts.pageSize || this.pageSize;
      this.resultSize = opts.resultSize || this.resultSize;

      if (!this.currentPage) {
        this.currentPage = this.resultSize ? 1 : 0;
      }

      this.pageCount = this.resultSize ? Math.floor(this.resultSize / this.pageSize) || 1 : (this.pageCount || 0);
      this.currentPageSize = this.pageSize + (this.currentPage == this.pageCount ? (this.resultSize - (this.currentPage * this.pageSize)) || 0 : 0);
      this.next = this.currentPage < this.pageCount;
      this.prev = this.currentPage > 1;
    };

    this.nextPage = function () {
      if (this.currentPage < this.pageCount) {
        this.currentPage++;
        this.update();
      }
    };

    this.prevPage = function () {
      if (this.currentPage > 1) {
        this.currentPage--;
        this.update();
      }
    };

    this.firstPage = function () {
      this.currentPage = 1;
      this.pageSize = this.defaultPageSize;
      this.update();
    };

    this.increasePageSize = function () {
      this.pageSize += this.defaultPageSize;
      this.update();
    };

    this.update(opts);
  };
}

angular
  .module('Squared')
  .service('PagerUtil', PagerUtil);
