import {
  IReportCard,
  IReportsTable,
  ITimespan,
  ISecondaryReport,
} from '../partnerReportInterfaces';

describe('Component: reportCard', () => {
  let activeUserData = getJSONFixture('core/json/partnerReports/activeUserData.json');
  let ctrlData = getJSONFixture('core/json/partnerReports/ctrl.json');
  let defaults = getJSONFixture('core/json/partnerReports/commonReportService.json');
  let endpointsData = getJSONFixture('core/json/partnerReports/registeredEndpointData.json');
  let timeFilter: ITimespan = _.clone(defaults.timeFilter[0]);

  beforeEach(function () {
    this.initModules('Core');
    this.injectDependencies('$scope', '$timeout');
  });

  describe('barchart and secondary table combination:', function () {
    let options: IReportCard = _.clone(ctrlData.activeUserOptions);
    let secondaryOptions: ISecondaryReport = _.clone(ctrlData.activeUserSecondaryOptions);
    let sortedArray: ISecondaryReport = _.clone(activeUserData.mostActiveResponse).sort(function (itemOne, itemTwo) {
      if (itemOne.totalActivity < itemTwo.totalActivity) {
        return 1;
      } else if (itemOne.totalActivity > itemTwo.totalActivity) {
        return -1;
      } else {
        let orgCompare = itemOne.orgName.localeCompare(itemTwo.orgName);
        if (orgCompare === -1) {
          return 1;
        } else if (orgCompare === 1) {
          return -1;
        } else {
          return itemOne.userName.localeCompare(itemTwo.userName);
        }
      }
    });
    options.table = undefined;
    secondaryOptions.table.data =  _.clone(activeUserData.mostActiveResponse);

    let checkTableEntries = (view: any, start: number, length: number) => {
      // the selected items from start to end should be visible
      for (let i = 0; i < length; i++) {
        expect(view.find('tr td.vertical-center')[0 + (4 * i)].innerText).toEqual(sortedArray[start + i].userName);
        expect(view.find('tr td.vertical-center')[1 + (4 * i)].innerText).toEqual(sortedArray[start + i].orgName);
        expect(view.find('tr td.vertical-center')[2 + (4 * i)].innerText).toEqual(sortedArray[start + i].numCalls.toString());
        expect(view.find('tr td.vertical-center')[3 + (4 * i)].innerText).toEqual(sortedArray[start + i].sparkMessages.toString());
      }
    };

    beforeEach(function () {
      this.$scope.timeFilter = timeFilter;
      this.$scope.options = options;
      this.$scope.secondaryOptions = secondaryOptions;
      this.$scope.show = true;
      this.$scope.resize = jasmine.createSpy('resize');
      this.compileComponent('reportCard', {
        options: 'options',
        secondaryOptions: 'secondaryOptions',
        resizePage: 'resize()',
        show: 'show',
        time: 'timeFilter',
      });
    });

    it('should instantiate with expected titles and secondary report not visible', function () {
      // check for header, description, and chart
      expect(this.view).toContainElement('#' + options.id);
      expect(this.view.find('span.report-section-header')).toHaveText(options.headerTitle);
      expect(this.view.find('section.report-barchart p')).toHaveText(options.description);
      expect(this.view).toContainElement('#' + options.id + 'Chart');

      // table for the first report section should not be present
      expect(this.view).not.toContainElement('section table');

      // verify secondary report is not visible, but link to open it is present
      expect(this.view).not.toContainElement('.report-table');
      expect(this.view.find('div.box-match a span')).toHaveText(options.id + '.show');
      expect(this.view).not.toContainElement('div.box-match div.pull-right button.carousel-control i.icon.icon-chevron-left');
      expect(this.view.find('div.box-match div.pull-right button.btn').length).toEqual(0);
      expect(this.view).not.toContainElement('div.box-match div.pull-right button.carousel-control i.icon.icon-chevron-right');
    });

    it('should open the secondary report on click and manipulate the secondary report table', function () {
      // open secondary report
      this.$timeout.flush();
      this.view.find('div.box-match a span').click();
      expect(this.view.find('div.box-match a span')).toHaveText(options.id + '.hide');
      expect(this.view).toContainElement('.report-table');
      expect(this.$scope.resize).toHaveBeenCalledTimes(1);

      // Verify table headers are populated
      let headers = this.view.find('thead th.bold.vertical-center');
      _.forEach(headers, (element, index: number) => {
        expect(element.innerText).toEqual(secondaryOptions.table.headers[index].title);
      });
      // Verify table is populated
      checkTableEntries(this.view, 0, 5);

      // verify table buttons are present
      expect(this.view).toContainElement('div.box-match div.pull-right button.carousel-control i.icon.icon-chevron-left');
      expect(this.view.find('div.box-match div.pull-right button.btn').length).toEqual(3);
      expect(this.view.find('div.box-match div.pull-right button.btn')[0]).toContainText('1');
      expect(this.view.find('div.box-match div.pull-right button.btn')[1]).toContainText('2');
      expect(this.view.find('div.box-match div.pull-right button.btn')[2]).toContainText('3');
      expect(this.view).toContainElement('div.box-match div.pull-right button.carousel-control i.icon.icon-chevron-right');

      // verify table buttons manipulate the table
      this.view.find('div.box-match div.pull-right button.btn')[1].click();
      expect(this.$scope.resize).toHaveBeenCalledTimes(2);
      checkTableEntries(this.view, 5, 5);

      // clicking all the way to the left should cause the table to stop moving and the buttons to stop changing on further left arrow clicks
      this.view.find('div.box-match div.pull-right button.carousel-control i.icon.icon-chevron-left').click();
      expect(this.$scope.resize).toHaveBeenCalledTimes(3);
      checkTableEntries(this.view, 0, 5);
      this.view.find('div.box-match div.pull-right button.carousel-control i.icon.icon-chevron-left').click();
      expect(this.$scope.resize).toHaveBeenCalledTimes(3);
      checkTableEntries(this.view, 0, 5);

      // button numbers should change on move to 'page 3'
      this.view.find('div.box-match div.pull-right button.btn')[2].click();
      expect(this.$scope.resize).toHaveBeenCalledTimes(4);
      checkTableEntries(this.view, 10, 5);
      expect(this.view.find('div.box-match div.pull-right button.btn')[0]).toContainText('2');
      expect(this.view.find('div.box-match div.pull-right button.btn')[1]).toContainText('3');
      expect(this.view.find('div.box-match div.pull-right button.btn')[2]).toContainText('4');

      // clicking all the way to the right should cause the table to stop moving and the buttons to stop changing on further right arrow clicks
      this.view.find('div.box-match div.pull-right button.carousel-control i.icon.icon-chevron-right').click();
      expect(this.$scope.resize).toHaveBeenCalledTimes(5);
      checkTableEntries(this.view, 15, 1);
      this.view.find('div.box-match div.pull-right button.carousel-control i.icon.icon-chevron-right').click();
      expect(this.$scope.resize).toHaveBeenCalledTimes(5);
      checkTableEntries(this.view, 15, 1);
      expect(this.view.find('div.box-match div.pull-right button.btn')[0]).toContainText('2');
      expect(this.view.find('div.box-match div.pull-right button.btn')[1]).toContainText('3');
      expect(this.view.find('div.box-match div.pull-right button.btn')[2]).toContainText('4');
    });
  });

  describe('donut chart only:', function () {
    let options: IReportCard = _.clone(ctrlData.callOptions);
    options.table = undefined;

    beforeEach(function () {
      this.$scope.timeFilter = timeFilter;
      this.$scope.options = options;
      this.$scope.show = true;
      this.compileComponent('reportCard', {
        options: 'options',
        show: 'show',
        time: 'timeFilter',
      });
    });

    it('should instantiate with expected titles and secondary report not present', function () {
      // check for header, description, and chart
      expect(this.view).toContainElement('#' + options.id);
      expect(this.view.find('span.report-section-header')).toHaveText(options.headerTitle);
      expect(this.view.find('section.report-donut p')).toHaveText(options.description);
      expect(this.view).toContainElement('#' + options.id + 'Chart');

      // table for the first report section should not be present
      expect(this.view).not.toContainElement('section table');

      // verify secondary report is not visible and link to open it is not present
      expect(this.view).not.toContainElement('.report-table');
      expect(this.view).not.toContainElement('div.box-match a span');
      expect(this.view).not.toContainElement('div.box-match div.pull-right button.carousel-control i.icon.icon-chevron-left');
      expect(this.view.find('div.box-match div.pull-right button.btn').length).toEqual(0);
      expect(this.view).not.toContainElement('div.box-match div.pull-right button.carousel-control i.icon.icon-chevron-right');
    });
  });

  describe('main report with table only:', function () {
    let options: IReportCard = _.clone(ctrlData.endpointOptions);
    let tableData: IReportsTable = _.clone(endpointsData.registeredEndpointResponse);
    options.table.data = tableData;

    beforeEach(function () {
      this.$scope.timeFilter = timeFilter;
      this.$scope.options = options;
      this.$scope.show = true;
      this.compileComponent('reportCard', {
        options: 'options',
        show: 'show',
        time: 'timeFilter',
      });
    });

    it('should instantiate with expected titles and secondary report not present', function () {
      // check for header, description, and table
      expect(this.view).toContainElement('#' + options.id);
      expect(this.view.find('span.report-section-header')).toHaveText(options.headerTitle);
      expect(this.view.find('section.report-table p')).toHaveText(options.description);
      expect(this.view).toContainElement('section table');

      // verify table headers
      let headers = this.view.find('thead th.bold.vertical-center');
      _.forEach(headers, (element, index: number) => {
        expect(element.innerText).toEqual(options.table.headers[index].title);
      });

      // verify table data
      let dataEntries = this.view.find('tbody tr');
      expect(dataEntries.length).toBe(4);
      _.forEach(dataEntries, function (element, index: number) {
        _.forEach(tableData[index], function (data) {
          expect(element).toContainText(data.output[0]);
          if (data.output.length > 1) {
            expect(element).toContainText(data.output[1]);
          }
        });
      });

      // chart for the first report section should not be present
      expect(this.view).not.toContainElement('#' + options.id + 'Chart');

      // verify secondary report is not visible and link to open it is not present
      expect(this.view).not.toContainElement('div.box-match a span');
      expect(this.view).not.toContainElement('div.box-match div.pull-right button.carousel-control i.icon.icon-chevron-left');
      expect(this.view.find('div.box-match div.pull-right button.btn').length).toEqual(0);
      expect(this.view).not.toContainElement('div.box-match div.pull-right button.carousel-control i.icon.icon-chevron-right');
    });
  });
});
