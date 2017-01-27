import {
  IExportMenu,
  IReportCard,
  IReportDropdown,
  IReportLabel,
  IReportsTable,
  ITimespan,
  ISecondaryReport,
} from '../partnerReportInterfaces';

describe('Component: reportCard', () => {
  let activeUserData = getJSONFixture('core/json/partnerReports/activeUserData.json');
  let ctrlData = getJSONFixture('core/json/partnerReports/ctrl.json');
  let defaults = getJSONFixture('core/json/partnerReports/commonReportService.json');
  let endpointsData = getJSONFixture('core/json/partnerReports/registeredEndpointData.json');
  let timeFilter: ITimespan = _.cloneDeep(defaults.timeFilter[0]);

  // html selectors
  const headerTitle: string = 'span.report-section-header';
  const reportType: string = '{{reportType}}';
  const cardDescription: string = 'section.report-' + reportType + ' p';
  const table: string = 'section table';
  const id: string = '{{id}}';
  const chart: string = '#' + id + 'Chart';
  const dropdown: string = '#' + id + 'Filter';
  const reportTable: string = '.report-table';
  const search: string = 'div.report-search';
  const showHideLink: string = 'div.box-match a span';
  const carouselNumberButtons: string = 'div.box-match div.pull-right button.btn';
  const carouselLeft: string = 'div.box-match div.pull-right button.carousel-control i.icon.icon-chevron-left';
  const carouselRight: string = 'div.box-match div.pull-right button.carousel-control i.icon.icon-chevron-right';
  const graphLabels: string = 'div.row div.columns.medium-4.label-display';
  const numberLabels: string = graphLabels + ' p.label-number';
  const textLabels: string = graphLabels + ' span.label-text';
  const exportMenu: string = '.grid-filter.dropdown.pull-right';

  beforeEach(function () {
    this.initModules('Core');
    this.injectDependencies('$scope', '$timeout');
  });

  describe('barchart and secondary table combination:', function () {
    let options: IReportCard = _.cloneDeep(ctrlData.activeUserOptions);
    let secondaryOptions: ISecondaryReport = _.cloneDeep(ctrlData.activeUserSecondaryOptions);
    let sortedArray: ISecondaryReport = _.cloneDeep(activeUserData.mostActiveResponse).sort(function (itemOne, itemTwo) {
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
    secondaryOptions.table.data =  _.cloneDeep(activeUserData.mostActiveResponse);

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
      expect(this.view.find(headerTitle)).toHaveText(options.headerTitle);
      expect(this.view.find(cardDescription.replace(reportType, options.reportType))).toHaveText(options.description);
      expect(this.view).toContainElement(chart.replace(id, options.id));
      expect(this.view).not.toContainElement(dropdown.replace(id, options.id));

      // table for the first report section, export menu, and labels should not be present
      expect(this.view).not.toContainElement(table);
      expect(this.view).not.toContainElement(graphLabels);
      expect(this.view).not.toContainElement(exportMenu);

      // verify secondary report is not visible, but link to open it is present
      expect(this.view).not.toContainElement(reportTable);
      expect(this.view.find(showHideLink)).toHaveText(options.id + '.show');
      expect(this.view).not.toContainElement(carouselLeft);
      expect(this.view.find(carouselNumberButtons).length).toEqual(0);
      expect(this.view).not.toContainElement(carouselRight);
    });

    it('should open the secondary report on click and manipulate the secondary report table', function () {
      // open secondary report
      this.$timeout.flush();
      this.view.find(showHideLink).click();
      expect(this.view.find(showHideLink)).toHaveText(options.id + '.hide');
      expect(this.view).toContainElement(reportTable);
      expect(this.$scope.resize).toHaveBeenCalledTimes(1);
      expect(this.view).not.toContainElement(search);

      // Verify table headers are populated
      let headers = this.view.find('thead th.bold.vertical-center');
      _.forEach(headers, (element, index: number) => {
        expect(element.innerText).toEqual(secondaryOptions.table.headers[index].title);
      });
      // Verify table is populated
      checkTableEntries(this.view, 0, 5);

      // verify table buttons are present
      expect(this.view).toContainElement(carouselLeft);
      expect(this.view.find(carouselNumberButtons).length).toEqual(3);
      expect(this.view.find(carouselNumberButtons)[0]).toContainText('1');
      expect(this.view.find(carouselNumberButtons)[1]).toContainText('2');
      expect(this.view.find(carouselNumberButtons)[2]).toContainText('3');
      expect(this.view).toContainElement(carouselRight);

      // verify table buttons manipulate the table
      this.view.find(carouselNumberButtons)[1].click();
      expect(this.$scope.resize).toHaveBeenCalledTimes(2);
      checkTableEntries(this.view, 5, 5);

      // clicking all the way to the left should cause the table to stop moving and the buttons to stop changing on further left arrow clicks
      this.view.find(carouselLeft).click();
      expect(this.$scope.resize).toHaveBeenCalledTimes(3);
      checkTableEntries(this.view, 0, 5);
      this.view.find(carouselLeft).click();
      expect(this.$scope.resize).toHaveBeenCalledTimes(3);
      checkTableEntries(this.view, 0, 5);

      // button numbers should change on move to 'page 3'
      this.view.find(carouselNumberButtons)[2].click();
      expect(this.$scope.resize).toHaveBeenCalledTimes(4);
      checkTableEntries(this.view, 10, 5);
      expect(this.view.find(carouselNumberButtons)[0]).toContainText('2');
      expect(this.view.find(carouselNumberButtons)[1]).toContainText('3');
      expect(this.view.find(carouselNumberButtons)[2]).toContainText('4');

      // clicking all the way to the right should cause the table to stop moving and the buttons to stop changing on further right arrow clicks
      this.view.find(carouselRight).click();
      expect(this.$scope.resize).toHaveBeenCalledTimes(5);
      checkTableEntries(this.view, 15, 1);
      this.view.find(carouselRight).click();
      expect(this.$scope.resize).toHaveBeenCalledTimes(5);
      checkTableEntries(this.view, 15, 1);
      expect(this.view.find(carouselNumberButtons)[0]).toContainText('2');
      expect(this.view.find(carouselNumberButtons)[1]).toContainText('3');
      expect(this.view.find(carouselNumberButtons)[2]).toContainText('4');

      // turn on search and verify search works
      this.$scope.secondaryOptions.search = true;
      this.$scope.$apply();
      expect(this.view).toContainElement(search);
      this.view.find(search + ' input').val(sortedArray[0].userName).change();
      checkTableEntries(this.view, 0, 1);
    });
  });

  describe('donut chart, labels, and dropdown:', function () {
    // html constants
    const dropdownClick: string = 'div.select-list div.dropdown .select-toggle';
    const hiddenSelect: string = 'select.hidden-select option';
    const dropdownOptions: string = 'ul.select-options li a';
    const threeDots: string = '.icon.icon-three-dots.export-dots';
    const clickDots: string = exportMenu + ' a';
    const exportOptions: string = exportMenu + ' li.export-item';

    // scope variables
    let options: IReportCard = _.cloneDeep(ctrlData.callOptions);
    let labels: Array<IReportLabel> = _.cloneDeep(ctrlData.metricsLabels);
    options.table = undefined;
    labels[0].class = 'test';
    labels[0].click = jasmine.createSpy('labelClick');
    labels[1].class = 'test';
    labels[1].hidden = true;
    let reportDropdown: IReportDropdown = {
      array: [{
        value: 0,
        label: 'label one',
      }, {
        value: 1,
        label: 'label two',
      }],
      click: jasmine.createSpy('toggle'),
      disabled: false,
      selected: {
        value: 0,
        label: 'label one',
      },
    };

    let exportArray: Array<IExportMenu> = _.cloneDeep(ctrlData.exportMenu);
    exportArray[1].click = jasmine.createSpy('click');

    beforeEach(function () {
      this.$scope.timeFilter = timeFilter;
      this.$scope.options = options;
      this.$scope.show = true;
      this.$scope.dropdown = reportDropdown;
      this.$scope.labels = labels;
      this.$scope.exportArray = exportArray;
      this.compileComponent('reportCard', {
        options: 'options',
        exportDropdown: 'exportArray',
        dropdown: 'dropdown',
        show: 'show',
        time: 'timeFilter',
        labels: 'labels',
      });
    });

    it('should instantiate with expected titles, labels, and dropdown present', function () {
      this.$timeout.flush();
      // check for header, description, and chart
      expect(this.view).toContainElement('#' + options.id);
      expect(this.view.find(headerTitle)).toHaveText(options.headerTitle);
      expect(this.view.find(cardDescription.replace(reportType, options.reportType))[0].innerText).toEqual(options.description);
      expect(this.view).toContainElement(chart.replace(id, options.id));
      expect(this.view).toContainElement(dropdown.replace(id, options.id));

      // check the dropdown
      expect(reportDropdown.click).not.toHaveBeenCalled();
      expect(this.view.find(hiddenSelect)).toHaveText(reportDropdown.array[0].label);
      this.view.find(dropdownClick).click();
      this.$timeout.flush();
      expect(this.view.find(dropdownOptions).length).toEqual(2);
      this.view.find(dropdownOptions)[1].click();
      expect(this.view.find(hiddenSelect)).toHaveText(reportDropdown.array[1].label);
      expect(reportDropdown.click).toHaveBeenCalled();

      // table for the first report section should not be present
      expect(this.view).not.toContainElement(table);

      // expect the export menu to be present and manipulatable
      expect(this.view).toContainElement(exportMenu);
      expect(this.view).toContainElement(threeDots);
      expect(this.view).not.toContain(exportOptions);
      this.view.find(clickDots)[0].click();
      let view = this.view;
      _.forEach(exportArray, function (exportItem: IExportMenu, index: number): void {
        expect(view.find(exportOptions).length).toEqual(exportArray.length);
        expect(view.find(exportOptions)[index].innerText.trim()).toEqual(exportItem.label);
      });
      this.view.find('#' + exportArray[1].id).click();
      expect(this.view).not.toContain(exportOptions);
      expect(exportArray[1].click).toHaveBeenCalledTimes(1);

      // verify the labels are present and work as expected
      expect(this.view.find(graphLabels).length).toEqual(3);
      _.forEach(labels, function (label, index) {
        expect(view.find(numberLabels)[index].innerText).toEqual(label.number.toString());
        expect(view.find(textLabels)[index].innerText).toEqual(label.text);
      });
      expect(this.view.find(numberLabels)[0]).toHaveClass('test');
      expect(this.view.find(numberLabels)[1]).not.toHaveClass('test');
      expect(labels[0].click).toHaveBeenCalledTimes(0);
      this.view.find(graphLabels)[0].click();
      expect(labels[0].click).toHaveBeenCalledTimes(1);

      // verify secondary report is not visible and link to open it is not present
      expect(this.view).not.toContainElement(reportTable);
      expect(this.view).not.toContainElement(showHideLink);
      expect(this.view).not.toContainElement(carouselLeft);
      expect(this.view.find(carouselNumberButtons).length).toEqual(0);
      expect(this.view).not.toContainElement(carouselRight);
    });
  });

  describe('main report with table only:', function () {
    let options: IReportCard = _.cloneDeep(ctrlData.endpointOptions);
    let tableData: IReportsTable = _.cloneDeep(endpointsData.registeredEndpointResponse);
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
      expect(this.view.find(headerTitle)).toHaveText(options.headerTitle);
      expect(this.view.find(cardDescription.replace(reportType, options.reportType))).toHaveText(options.description);
      expect(this.view).toContainElement(table);
      expect(this.view).not.toContainElement(dropdown.replace(id, options.id));

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
      expect(this.view).not.toContainElement(chart.replace(id, options.id));

      // verify secondary report is not visible and link to open it is not present
      expect(this.view).not.toContainElement(showHideLink);
      expect(this.view).not.toContainElement(carouselLeft);
      expect(this.view.find(carouselNumberButtons).length).toEqual(0);
      expect(this.view).not.toContainElement(carouselRight);
    });
  });
});
