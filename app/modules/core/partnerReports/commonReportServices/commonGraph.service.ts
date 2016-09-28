export class CommonGraphService {
  /* @ngInject */
  constructor(
    private chartColors,
    private $translate,
    private $window
  ) {}

  private baseVariables = {
    axis: {
      axisColor: this.chartColors.grayLight,
      gridColor: this.chartColors.grayLight,
      color: this.chartColors.grayDarkest,
      titleColor: this.chartColors.grayDarkest,
      fontFamily: 'CiscoSansTT Light',
      gridAlpha: 0,
      axisAlpha: 1,
      tickLength: 0,
    },
    balloon: {
      adjustBorderColor: true,
      borderThickness: 1,
      fillAlpha: 1,
      fillColor: this.chartColors.brandWhite,
      fixedPosition: true,
      shadowAlpha: 0,
    },
    column: {
      type: 'column',
      fillAlphas: 1,
      lineAlpha: 0,
      balloonColor: this.chartColors.grayLight,
      columnWidth: 0.6,
    },
    cursor: {
      cursorAlpha: 0,
      categoryBalloonEnabled: false,
      oneBalloonOnly: true,
      balloonPointerOrientation: 'vertical',
      showNextAvailable: true,
    },
    export: {
      enabled: true,
      position: 'top-left',
      libs: {
        autoLoad: false,
      },
      menu: [{
        class: 'export-main',
        label: this.$translate.instant('reportsPage.downloadOptions'),
        menu: [{
          label: this.$translate.instant('reportsPage.saveAs'),
          title: this.$translate.instant('reportsPage.saveAs'),
          class: 'export-list',
          menu: ['PNG', 'JPG'],
        }, {
          label: this.$translate.instant('reportsPage.pdf'),
          title: this.$translate.instant('reportsPage.pdf'),
          click: _.partial(function (commonGraphService: CommonGraphService) {
            this.capture({}, function () {
              this.toPDF({}, function (data) {
                commonGraphService.$window.open(data, 'amCharts.pdf');
              });
            });
          }, this),
        }],
      }],
    },
    legend: {
      color: this.chartColors.grayDarkest,
      align: 'center',
      autoMargins: false,
      switchable: false,
      fontSize: 13,
      markerLabelGap: 10,
      markerType: 'square',
      markerSize: 10,
      position: 'bottom',
      equalWidths: false,
      horizontalGap: 5,
      valueAlign: 'left',
      valueWidth: 0,
      verticalGap: 20,
    },
    line: {
      type: 'line',
      bullet: 'round',
      fillAlphas: 0,
      lineAlpha: 1,
      lineThickness: 3,
      hidden: false,
    },
    numFormat: {
      precision: 0,
      decimalSeparator: '.',
      thousandsSeparator: ',',
    },
    prefixesOfBigNumbers: [{
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
    }],
    scroll: {
      autoGridCount: true,
    },
  };

  public getBaseVariable(key: string): any {
    if (this.baseVariables[key]) {
      return _.clone(this.baseVariables[key]);
    } else {
      return;
    }
  }

  public getBaseSerialGraph(data: Array<any>, startDuration: number, valueAxes: Array<any>, graphs: Array<any>, categoryField: string, catAxis: any): any {
    return _.clone({
      type: 'serial',
      startEffect: 'easeOutSine',
      addClassNames: true,
      fontFamily: 'CiscoSansTT Extra Light',
      backgroundColor: this.chartColors.brandWhite,
      backgroundAlpha: 1,
      balloon: this.baseVariables['balloon'],
      autoMargins: false,
      marginLeft: 60,
      marginTop: 60,
      marginRight: 60,
      usePrefixes: true,
      prefixesOfBigNumbers: this.baseVariables['prefixesOfBigNumbers'],
      export: this.baseVariables['export'],
      startDuration: startDuration,
      dataProvider: data,
      valueAxes: valueAxes,
      graphs: graphs,
      categoryField: categoryField,
      categoryAxis: catAxis,
    });
  }

  public getBasePieChart(data: Array<any>, balloonText: string, innerRadius: string, radius: string, labelText: string, labelsEnabled: boolean, titleField: string, valueField: string, colorField: string, labelColorField: string): any {
    return _.clone({
      type: 'pie',
      balloon: this.baseVariables['balloon'],
      export: this.baseVariables['export'],
      fontFamily: 'Arial',
      fontSize: 14,
      percentPrecision: 0,
      labelRadius: 25,
      creditsPosition: 'bottom-left',
      outlineAlpha: 1,
      startDuration: 0,
      dataProvider: data,
      balloonText: balloonText,
      innerRadius: innerRadius,
      radius: radius,
      labelText: labelText,
      labelsEnabled: labelsEnabled,
      titleField: titleField,
      valueField: valueField,
      colorField: colorField,
      labelColorField: labelColorField,
    });
  }
}

angular.module('Core')
  .service('CommonGraphService', CommonGraphService);