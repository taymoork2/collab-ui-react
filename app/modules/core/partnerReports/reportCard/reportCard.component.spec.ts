import reportCardModule from './index';

describe('Component: reportCard', function () {
  beforeEach(function () {
    this.initModules(reportCardModule);
    this.injectDependencies('$componentController', '$scope', '$state', '$translate', 'ReportConstants');

    this.activeUserData = getJSONFixture('core/json/partnerReports/activeUserData.json');
    this.ctrlData = getJSONFixture('core/json/partnerReports/ctrl.json');
    this.defaults = getJSONFixture('core/json/partnerReports/commonReportService.json');

    this.options = _.cloneDeep(this.ctrlData.activeUserOptions);
    this.secondaryOptions = _.cloneDeep(this.ctrlData.activeUserSecondaryOptions);
    this.secondaryOptions.table.data =  _.cloneDeep(this.activeUserData.mostActiveResponse);
    this.show = true;
    this.resizePage = jasmine.createSpy('resize');

    this.description = 'description';
    this.header = 'label';
    this.search = 'activeUsers.search';
    this.translation = 'translation';
    this.threeMonths = 'reportsPage.threeMonths';
    this.threeMonthsTwo = 'reportsPage.threeMonths2';
    this.length = this.secondaryOptions.sortOptions.length - 1;
    this.getTranslation = (type: string): any[][] => {
      return [[this.translation, { time: this.time[type] }]];
    };

    spyOn(this.$translate, 'instant').and.callThrough();
    spyOn(this.$state, 'go');

    this.initController = (): void => {
      this.controller = this.$componentController('reportCard', {
        $scope: this.$scope,
        $translate: this.$translate,
        $state: this.$state,
        ReportConstants: this.ReportConstants,
      }, {
        dropdown: this.dropdown,
        exportDropdown: this.exportDropdown,
        options: this.options,
        labels: this.labels,
        secondaryOptions: this.secondaryOptions,
        resizePage: this.resizePage,
        show: this.show,
        time: this.time,
        lowerTooltip: this.lowerTooltip,
      });
      this.$scope.$apply();
    };
  });

  it('should instantiate with expected translation calls and secondary report not visible', function () {
    this.time = this.defaults.timeFilter[0];
    this.initController();

    expect(this.$translate.instant.calls.allArgs()).toEqual([[this.search]]);
    expect(this.controller.secondaryOptions.display).toBeTruthy();
    expect(this.controller.exportMenu).toBeFalsy();
    expect(this.controller.secondaryReport).toBeFalsy();
    expect(this.controller.currentPage).toEqual(1);
    expect(this.controller.pagingButtons).toEqual([1, 2, 3]);
    expect(this.controller.totalPages).toEqual(4);
    expect(this.controller.placeholder).toEqual(this.search);
    expect(this.controller.searchField).toEqual('');
  });

  // Main Report Test Cases
  it('goToUsersTab - should change state to users tab', function () {
    this.initController();
    this.controller.goToUsersTab();
    expect(this.$state.go).toHaveBeenCalledWith('users.list');
  });

  describe('getClass - ', function () {
    beforeEach(function () {
      this.labels = _.cloneDeep(this.ctrlData.metricsLabels);
      this.labels[0].class = 'test';
    });

    it('should return undefined from a label with no class set', function () {
      this.initController();
      expect(this.controller.getClass(this.labels[1])).toBeUndefined();
    });

    it('should return undefined from a label with a class set and hidden is true', function () {
      this.labels[0].hidden = true;
      this.initController();
      expect(this.controller.getClass(this.labels[0])).toBeUndefined();
    });

    it('should return class from a label with a class set and hidden is false', function () {
      this.labels[0].hidden = false;
      this.initController();
      expect(this.controller.getClass(this.labels[0])).toEqual(this.labels[0].class);
    });
  });

  describe('getTranslation - ', function () {
    it('should call for a translation with time variable', function () {
      this.time = this.defaults.timeFilter[0];
      this.initController();
      this.$translate.instant.calls.reset();
      const translation = this.controller.getTranslation(this.translation, this.description);

      expect(translation).toEqual(this.translation);
      expect(this.$translate.instant.calls.allArgs()).toEqual(this.getTranslation(this.description));
    });

    it('should call for a translation without time variable', function () {
      this.initController();
      this.$translate.instant.calls.reset();
      const translation = this.controller.getTranslation(this.translation, this.description);

      expect(translation).toEqual(this.translation);
      expect(this.$translate.instant.calls.allArgs()).toEqual([[this.translation]]);
    });
  });

  describe('getDescription - ', function () {
    beforeEach(function () {
      this.twelveWeeksTwo = 'reportsPage.lastTwelveWeeks2';
      this.time = this.defaults.timeFilter[2];
      this.initController();
      spyOn(this.controller, 'getTranslation').and.callThrough();
      this.$translate.instant.calls.reset();
    });

    it('should call getTranslation', function () {
      const translation = this.controller.getDescription(this.translation, false);
      const translationArray: any[][] = this.getTranslation(this.description);
      translationArray.unshift([this.threeMonthsTwo]);
      translationArray.unshift([this.threeMonths]);

      expect(translation).toEqual(this.translation);
      expect(this.controller.getTranslation).toHaveBeenCalled();
      expect(this.$translate.instant.calls.allArgs()).toEqual(translationArray);
    });

    it('should use alternate translation', function () {
      const translation = this.controller.getDescription(this.translation, true);
      expect(translation).toEqual(this.translation);
      expect(this.controller.getTranslation).not.toHaveBeenCalled();
      expect(this.$translate.instant.calls.allArgs()).toEqual([[this.threeMonths], [this.threeMonthsTwo], [this.twelveWeeksTwo], [this.translation, { time: this.twelveWeeksTwo }]]);
    });
  });

  describe('getHeader - ', function () {
    beforeEach(function () {
      this.twelveWeeks = 'reportsPage.lastTwelveWeeks';
      this.time = this.defaults.timeFilter[2];
      this.initController();
      spyOn(this.controller, 'getTranslation').and.callThrough();
      this.$translate.instant.calls.reset();
    });

    it('should call getTranslation', function () {
      const translation = this.controller.getHeader(this.translation, false);
      const translationArray: any[][] = this.getTranslation(this.header);
      translationArray.unshift([this.threeMonthsTwo]);
      translationArray.unshift([this.threeMonths]);

      expect(translation).toEqual(this.translation);
      expect(this.controller.getTranslation).toHaveBeenCalled();
      expect(this.$translate.instant.calls.allArgs()).toEqual(translationArray);
    });

    it('should use alternate translation', function () {
      const translation = this.controller.getHeader(this.translation, true);
      expect(translation).toEqual(this.translation);
      expect(this.controller.getTranslation).not.toHaveBeenCalled();
      expect(this.$translate.instant.calls.allArgs()).toEqual([[this.threeMonths], [this.threeMonthsTwo], [this.twelveWeeks], [this.translation, { time: this.twelveWeeks }]]);
    });
  });

  describe('getPopoverText & isPopover - ', function () {
    it('should return options.popoverText when isPopover is true', function () {
      this.options.titlePopover = 'title';
      this.initController();
      this.$translate.instant.calls.reset();

      expect(this.controller.isPopover()).toBeTruthy();
      expect(this.controller.getPopoverText()).toEqual(this.options.titlePopover);
      expect(this.$translate.instant.calls.allArgs()).toEqual([[this.options.titlePopover]]);
    });

    it('should return empty string when isPopover is false', function () {
      this.options.titlePopover = this.ReportConstants.UNDEF;
      this.initController();
      this.$translate.instant.calls.reset();

      expect(this.controller.isPopover()).toBeFalsy();
      expect(this.controller.getPopoverText()).toEqual('');
      expect(this.$translate.instant).not.toHaveBeenCalled();
    });
  });

  describe('isDonut - ', function () {
    it('should return false for non donut report types', function () {
      this.initController();
      expect(this.controller.isDonut()).toBeFalsy();
    });

    it('should return true for donut report types', function () {
      this.options.reportType = this.ReportConstants.DONUT;
      this.initController();
      expect(this.controller.isDonut()).toBeTruthy();
    });
  });

  describe('isTable - ', function () {
    it('should return false for non table report types', function () {
      this.initController();
      expect(this.controller.isTable()).toBeFalsy();
    });

    it('should return true for table report types', function () {
      this.options.reportType = this.ReportConstants.TABLE;
      this.initController();
      expect(this.controller.isTable()).toBeTruthy();
    });
  });

  describe('isSet, isEmpty, & isRefresh', function () {
    it('only isSet should return true when the report is set', function () {
      this.initController();
      expect(this.controller.isSet()).toBeTruthy();
      expect(this.controller.isEmpty()).toBeFalsy();
      expect(this.controller.isRefresh()).toBeFalsy();
    });

    it('only isEmpty should return true when the report is empty', function () {
      this.options.state = this.ReportConstants.EMPTY;
      this.initController();
      expect(this.controller.isSet()).toBeFalsy();
      expect(this.controller.isEmpty()).toBeTruthy();
      expect(this.controller.isRefresh()).toBeFalsy();
    });

    it('only isRefresh should return true when the report is refreshing', function () {
      this.options.state = this.ReportConstants.REFRESH;
      this.initController();
      expect(this.controller.isSet()).toBeFalsy();
      expect(this.controller.isEmpty()).toBeFalsy();
      expect(this.controller.isRefresh()).toBeTruthy();
    });
  });

  // Secondary Report Test Cases
  it('resetReport - should reset secondary report controls back to default', function () {
    this.initController();
    this.controller.secondaryReport = true;
    this.controller.currentPage = 3;
    this.controller.pagingButtons = [2, 3, 4];
    this.controller.searchField = this.search;

    spyOn(this.controller, 'setTotalPages');
    spyOn(this.controller, 'setSortOptions');

    this.controller.resetReport();
    expect(this.controller.secondaryReport).toBeFalsy();
    expect(this.controller.currentPage).toEqual(1);
    expect(this.controller.pagingButtons).toEqual([1, 2, 3]);
    expect(this.controller.searchField).toEqual('');
    expect(this.controller.setTotalPages).toHaveBeenCalled();
    expect(this.controller.setSortOptions).toHaveBeenCalled();
  });

  it('resize - should call resizePage when resizePage is set', function () {
    this.initController();
    this.controller.resize();
    expect(this.resizePage).toHaveBeenCalled();
  });

  it('openCloseSecondaryReport - should toggle secondary report', function () {
    this.initController();
    this.controller.openCloseSecondaryReport();
    expect(this.controller.secondaryReport).toBeTruthy();
    expect(this.resizePage).toHaveBeenCalled();
  });

  it('secondaryTableHasRows should return true only when the secondaryTable has data', function () {
    this.initController();
    expect(this.controller.secondaryTableHasRows()).toBeTruthy();

    this.controller.secondaryOptions.table.data = [];
    expect(this.controller.secondaryTableHasRows()).toBeFalsy();
  });

  describe('changePage - ', function () {
    it('should change the pagingButtons', function () {
      this.initController();
      this.controller.changePage(3);
      expect(this.controller.pagingButtons).toEqual([2, 3, 4]);
      expect(this.controller.currentPage).toEqual(3);
      expect(this.resizePage).toHaveBeenCalled();
    });

    it('should not change the pagingButtons', function () {
      this.initController();
      this.controller.currentPage = 2;

      this.controller.changePage(1);
      expect(this.controller.pagingButtons).toEqual([1, 2, 3]);
      expect(this.controller.currentPage).toEqual(1);
      expect(this.resizePage).toHaveBeenCalled();
    });
  });

  describe('isActivePage - ', function () {
    it('should return true when row is located on the currentPage', function () {
      this.initController();
      expect(this.controller.isActivePage(1)).toBeTruthy();
    });

    it('should return false when row is not located on the currentPage', function () {
      this.initController();
      expect(this.controller.isActivePage(7)).toBeFalsy();
    });
  });

  describe('isCurrentPage - ', function () {
    it('should return true when the paging button represents the currentPage', function () {
      this.initController();
      expect(this.controller.isCurrentPage(0)).toBeTruthy();
    });

    it('should return false when the paging button does not represent the currentPage', function () {
      this.initController();
      expect(this.controller.isCurrentPage(2)).toBeFalsy();
    });
  });

  describe('secondaryIsSet, secondaryIsEmpty, secondaryIsError, & secondaryIsRefresh', function () {
    it('only secondaryIsSet should return true when the report is set', function () {
      this.initController();
      expect(this.controller.secondaryIsSet()).toBeTruthy();
      expect(this.controller.secondaryIsEmpty()).toBeFalsy();
      expect(this.controller.secondaryIsError()).toBeFalsy();
      expect(this.controller.secondaryIsRefresh()).toBeFalsy();
    });

    it('only secondaryIsEmpty should return true when the report is empty', function () {
      this.secondaryOptions.state = this.ReportConstants.EMPTY;
      this.initController();
      expect(this.controller.secondaryIsSet()).toBeFalsy();
      expect(this.controller.secondaryIsEmpty()).toBeTruthy();
      expect(this.controller.secondaryIsError()).toBeFalsy();
      expect(this.controller.secondaryIsRefresh()).toBeFalsy();
    });

    it('only secondaryIsError should return true when the report is in error', function () {
      this.secondaryOptions.state = this.ReportConstants.ERROR;
      this.initController();
      expect(this.controller.secondaryIsSet()).toBeFalsy();
      expect(this.controller.secondaryIsEmpty()).toBeFalsy();
      expect(this.controller.secondaryIsError()).toBeTruthy();
      expect(this.controller.secondaryIsRefresh()).toBeFalsy();
    });

    it('only secondaryIsRefresh should return true when the report is refreshing', function () {
      this.secondaryOptions.state = this.ReportConstants.REFRESH;
      this.initController();
      expect(this.controller.secondaryIsSet()).toBeFalsy();
      expect(this.controller.secondaryIsEmpty()).toBeFalsy();
      expect(this.controller.secondaryIsError()).toBeFalsy();
      expect(this.controller.secondaryIsRefresh()).toBeTruthy();
    });
  });

  describe('pageBackward & pageForward - ', function () {
    beforeEach(function () {
      this.initController();
      spyOn(this.controller, 'changePage').and.callThrough();
    });

    it('should page foward or backward as expected', function () {
      this.controller.pageForward();
      expect(this.controller.currentPage).toEqual(2);
      expect(this.controller.changePage).toHaveBeenCalledTimes(1);

      this.controller.pageBackward();
      expect(this.controller.currentPage).toEqual(1);
      expect(this.controller.changePage).toHaveBeenCalledTimes(2);
    });

    it('should not page forward when already on the last page',  function () {
      this.controller.currentPage = 4;
      this.controller.pageForward();
      expect(this.controller.currentPage).toEqual(4);
      expect(this.controller.changePage).not.toHaveBeenCalled();
    });

    it('should not page backward when already on the first page',  function () {
      this.controller.pageBackward();
      expect(this.controller.currentPage).toEqual(1);
      expect(this.controller.changePage).not.toHaveBeenCalled();
    });
  });

  describe('secondaryReportSort, getPredicate, & getSortDirection - ', function () {
    it('should reverse directions when selected sortOption matches the predicate', function () {
      this.initController();
      expect(this.controller.getSortDirection()).toEqual(this.secondaryOptions.sortOptions[this.length].direction);
      expect(this.controller.getPredicate()).toEqual(this.secondaryOptions.sortOptions[this.length].option);

      this.controller.secondaryReportSort(this.length);
      expect(this.controller.getSortDirection()).toEqual(!this.secondaryOptions.sortOptions[this.length].direction);
      expect(this.controller.getPredicate()).toEqual(this.secondaryOptions.sortOptions[this.length].option);
    });

    it('should change predicate and sort direction whe selected sortOption does not matche the predicate', function () {
      this.initController();
      this.controller.secondaryReportSort(1);
      expect(this.controller.getSortDirection()).toEqual(this.secondaryOptions.sortOptions[1].direction);
      expect(this.controller.getPredicate()).toEqual(this.secondaryOptions.sortOptions[1].option);
    });
  });

  describe('getTable - ', function () {
    it('should return whole table when the search field is empty', function () {
      this.initController();
      expect(this.controller.getTable()).toEqual(this.secondaryOptions.table.data);
      expect(this.resizePage).not.toHaveBeenCalled();
    });

    it('should return partial table when search field is set', function () {
      this.initController();
      this.controller.searchField = this.secondaryOptions.table.data[1].userName;
      expect(this.controller.getTable()).toEqual([this.secondaryOptions.table.data[1]]);
      expect(this.resizePage).toHaveBeenCalled();
    });
  });
});
