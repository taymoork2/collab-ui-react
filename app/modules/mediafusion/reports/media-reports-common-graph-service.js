(function () {
  'use strict';

  angular.module('Mediafusion').service('CommonReportsGraphService', CommonReportsGraphService);

  var ChartColors = require('modules/core/config/chartColors').ChartColors;

  /* @ngInject */
  function CommonReportsGraphService($translate) {
    var amchartsImages = './amcharts/images/';
    // Base variables for building grids and charts
    AmCharts.translations['export']['en']['menu.label.save.data'] = $translate.instant('reportsPage.saveAs');
    var baseVariables = [];
    baseVariables['column'] = {
      type: 'column',
      fillAlphas: 1,
      lineAlpha: 0,
      balloonColor: ChartColors.grayLightTwo,
      columnWidth: 4,
    };
    baseVariables['smoothedLine'] = {
      type: 'smoothedLine',
      lineColor: ChartColors.colorPurple,
      lineThickness: 2,
      balloonColor: ChartColors.grayLightTwo,
      negativeLineColor: ChartColors.colorPurple,
      negativeBase: 100,
    };
    baseVariables['line'] = {
      type: 'line',
      bullet: 'round',
      fillAlphas: 0,
      lineAlpha: 1,
      lineThickness: 3,
      hidden: false,
    };
    baseVariables['axis'] = {
      axisColor: '#1C1C1C',
      gridColor: '#1C1C1C',
      color: ChartColors.grayDarkThree,
      titleColor: ChartColors.grayDarkThree,
      fontFamily: 'CiscoSansTT Light',
      gridAlpha: 0,
      axisAlpha: 0.5,
      tickLength: 0,
    };
    baseVariables['guideaxis'] = {
      axisColor: ChartColors.grayLightTwo,
      gridColor: ChartColors.grayLightTwo,
      color: ChartColors.grayDarkThree,
      titleColor: ChartColors.grayDarkThree,
      fontFamily: 'CiscoSansTT Light',
      gridAlpha: 0,
      axisAlpha: 1,
      tickLength: 0,
    };
    baseVariables['legend'] = {
      color: ChartColors.primaryBase,
      autoMargins: false,
      align: 'right',
      position: 'bottom',
      switchable: true,
      fontSize: 13,
      markerLabelGap: 10,
      markerType: 'square',
      markerSize: 10,
      equalWidths: false,
      horizontalGap: 5,
      valueAlign: 'left',
      valueWidth: 0,
      verticalGap: 20,
    };
    baseVariables['numFormat'] = {
      precision: 0,
      decimalSeparator: '.',
      thousandsSeparator: ',',
    };
    baseVariables['balloon'] = {
      adjustBorderColor: true,
      borderThickness: 1,
      fillAlpha: 1,
      fillColor: ChartColors.brandWhite,
      fixedPosition: true,
      shadowAlpha: 0,
    };
    baseVariables['export'] = {
      enabled: true,
      libs: {
        autoLoad: false,
      },
      menu: [{
        class: 'export-main',
        label: $translate.instant('reportsPage.downloadOptions'),
        menu: [{
          label: $translate.instant('reportsPage.saveAs'),
          title: $translate.instant('reportsPage.saveAs'),
          class: 'export-list',
          menu: ['PNG', 'JPG', 'PDF'],
        }, 'PRINT'],
      }],
    };
    baseVariables['prefixesOfBigNumbers'] = [{
      number: 1e+3,
      prefix: 'K',
    }, {
      number: 1e+6,
      prefix: 'M',
    }, {
      number: 1e+9,
      prefix: 'B',
    }, {
      number: 1e+12,
      prefix: 'T',
    }];
    return {
      getBaseVariable: getBaseVariable,
      getBaseExportForGraph: getBaseExportForGraph,
      getBaseStackSerialGraph: getBaseStackSerialGraph,
      getGanttGraph: getGanttGraph,
      getBasePieChart: getBasePieChart,
      getDummyPieChart: getDummyPieChart,
    };

    function getBaseVariable(key) {
      if (baseVariables[key] !== null && !_.isUndefined(baseVariables[key])) {
        return _.cloneDeep(baseVariables[key]);
      } else {
        return {};
      }
    }

    function getBaseExportForGraph(fields, fileName, columnNames, iconDiv) {
      baseVariables['export'] = {
        enabled: true,
        divId: iconDiv,
        exportFields: fields,
        columnNames: columnNames,
        fileName: fileName,
        libs: {
          autoLoad: false,
        },
        menu: [{
          class: 'export-main',
          label: $translate.instant('reportsPage.downloadOptions'),
          title: $translate.instant('reportsPage.saveAs'),
          menu: ['save.data', 'PNG', 'JPG', 'PDF', 'CSV', 'XLSX'],
        }],
      };
      return baseVariables['export'];
    }

    function getBaseStackSerialGraph(data, startDuration, valueAxes, graphs, categoryField, catAxis, exportData) {
      return _.cloneDeep({
        type: 'serial',
        pathToImages: amchartsImages,
        startEffect: 'easeOutSine',
        addClassNames: true,
        fontFamily: 'CiscoSansTT Extra Light',
        backgroundColor: ChartColors.brandWhite,
        backgroundAlpha: 1,
        balloon: baseVariables['balloon'],
        autoMargins: false,
        marginLeft: 100,
        marginTop: 60,
        marginRight: 60,
        usePrefixes: true,
        prefixesOfBigNumbers: baseVariables['prefixesOfBigNumbers'],
        export: exportData,
        startDuration: startDuration,
        dataProvider: data,
        valueAxes: valueAxes,
        graphs: graphs,
        gridAboveGraphs: true,
        categoryField: categoryField,
        categoryAxis: catAxis,
        mouseWheelZoomEnabled: false,
        chartCursor: {
          cursorColor: '#55bb76',
          categoryBalloonDateFormat: 'JJ:NN, DD MMMM',
          valueBalloonsEnabled: false,
          cursorAlpha: 0,
          valueLineAlpha: 0.5,
          valueLineBalloonEnabled: true,
          valueLineEnabled: true,
          zoomable: true,
          valueZoomable: false,
        },
        chartScrollbar: {
          offset: 20,
          scrollbarHeight: 2,
          backgroundAlpha: 0,
          selectedBackgroundAlpha: 0.4,
          selectedBackgroundColor: '#a6a6a6',
          dragIcon: 'dragIconRoundSmall',
          dragIconHeight: 25,
          dragIconWidth: 25,
          graphFillAlpha: 0,
          graphLineAlpha: 0.5,
          selectedGraphFillAlpha: 0,
          selectedGraphLineAlpha: 1,
          autoGridCount: true,
          color: '#AAAAAA',
          updateOnReleaseOnly: true,
        },
        valueScrollbar: {
          offset: 20,
          color: '#AAAAAA',
          backgroundColor: ChartColors.brandWhite,
          backgroundAlpha: 1,
          oppositeAxis: false,
          selectedBackgroundAlpha: 0.4,
          selectedBackgroundColor: '#a6a6a6',
          dragIcon: 'dragIconRoundSmall',
          dragIconHeight: 25,
          dragIconWidth: 25,
          scrollbarHeight: 2,
        },
      });
    }

    function getGanttGraph(data, valueAxis, exportData, catAxis) {
      return _.cloneDeep({
        type: 'gantt',
        pathToImages: amchartsImages,
        theme: 'light',
        autoMargins: false,
        marginLeft: 95,
        marginRight: 70,
        balloonDateFormat: 'JJ:NN',
        columnWidth: 0.035,
        valueAxis: valueAxis,
        brightnessStep: 0,
        fontFamily: 'CiscoSansTT Extra Light',
        graph: {
          fillAlphas: 1,
          balloonText: '<b>[[availability]]</b></br><b>[[nodes]]</b>',
        },
        balloon: {
          fixedPosition: false,
        },
        rotate: true,
        categoryField: 'category',
        categoryAxis: catAxis,
        segmentsField: 'segments',
        colorField: 'color',
        startDateField: 'startTime',
        endDateField: 'endTime',
        dataProvider: data,
        valueScrollbar: {
          autoGridCount: true,
          color: '#AAAAAA',
          backgroundColor: '#D7DBDD',
          backgroundAlpha: 1,
          updateOnReleaseOnly: true,
          selectedBackgroundAlpha: 0.4,
          selectedBackgroundColor: '#a6a6a6',
          dragIcon: 'dragIconRoundSmall',
          dragIconHeight: 25,
          dragIconWidth: 25,
          scrollbarHeight: 2,
        },
        chartCursor: {
          cursorColor: '#55bb76',
          valueBalloonsEnabled: false,
          cursorAlpha: 0,
          valueLineAlpha: 0.5,
          valueLineBalloonEnabled: true,
          valueLineEnabled: true,
          zoomable: false,
          valueZoomable: true,
        },
        export: exportData,
      });
    }

    function getBasePieChart(data) {
      return _.cloneDeep({
        type: 'pie',
        theme: 'light',
        titleField: 'name',
        valueField: 'value',
        startDuration: 0,
        labelRadius: 5,
        radius: '36%',
        innerRadius: '55%',
        colorField: 'color',
        labelText: '[[name]]',
        balloonText: '[[name]]: [[percents]]% ([[value]])',
        dataProvider: data,
        outlineThickness: 0,
        hoverAlpha: 0.5,
        marginBottom: 5,
        marginLeft: 5,
        marginRight: 5,
        marginTop: 5,
        autoMargins: false,
        pullOutRadius: '1%',
        allLabels: [],
        balloon: {},
        fontSize: 10,
        titles: [],
      });
    }

    function getDummyPieChart() {
      return _.cloneDeep({
        type: 'pie',
        theme: 'light',
        titleField: 'name',
        valueField: 'value',
        startDuration: 0,
        labelRadius: 5,
        radius: '42%',
        innerRadius: '60%',
        labelText: '[[title]]',
        marginBottom: 5,
        marginLeft: 5,
        marginRight: 5,
        marginTop: 5,
        autoMargins: false,
        balloonText: '',
        pullOutRadius: '1%',
        colorField: 'color',
        outlineColor: '#ECECEC',
        borderColor: '#A4ACAC',
        fontSize: 10,
        balloon: {
          fontSize: 0,
        },
        titles: [],
        dataProvider: [{
          name: '',
          value: '60',
          color: '#ececec',
        }, {
          name: '',
          value: '40',
          color: '#d9d9d9',
        }],
      });
    }
  }
})();
