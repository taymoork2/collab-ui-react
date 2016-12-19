export class CommonGraphService {
  public readonly AXIS: string = 'axis';
  public readonly COLOR: string = 'color';
  public readonly COLUMN: string = 'column';
  public readonly CURSOR: string = 'cursor';
  public readonly DATE: string = 'date';
  public readonly LEGEND: string = 'legend';
  public readonly LINE: string = 'line';
  public readonly LINE_AXIS: string = 'lineAxis';
  public readonly NUMFORMAT: string = 'numFormat';
  public readonly prefixes: string = 'prefixesOfBigNumbers';
  public readonly START: string = 'start';
  public readonly TITLE: string = 'title';

  /* @ngInject */
  constructor(
    private chartColors,
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
      libs: {
        autoLoad: false,
      },
      menu: [],
    },
    legend: {
      color: this.chartColors.grayDarkest,
      align: 'center',
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
      bullet: 'none',
      fillAlphas: 0.5,
      lineAlpha: 1,
      lineThickness: 1,
      hidden: false,
    },
    lineAxis: {
      axisColor: this.chartColors.grayLight,
      gridColor: this.chartColors.grayLightTwo,
      color: this.chartColors.grayDarkest,
      titleColor: this.chartColors.grayDarkest,
      fontFamily: 'CiscoSansTT Light',
      gridAlpha: 1,
      axisAlpha: 1,
      tickLength: 5,
      startOnAxis: true,
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
  };

  public getBaseVariable(key: string): any {
    if (this.baseVariables[key]) {
      return _.cloneDeep(this.baseVariables[key]);
    } else {
      return;
    }
  }

  public getBaseSerialGraph(data: Array<any>, startDuration: number, valueAxes: Array<any>, graphs: Array<any>, categoryField: string, catAxis: any): any {
    return _.cloneDeep({
      type: 'serial',
      startEffect: 'easeOutSine',
      addClassNames: true,
      fontFamily: 'CiscoSansTT Extra Light',
      backgroundColor: this.chartColors.brandWhite,
      backgroundAlpha: 1,
      balloon: this.getBaseVariable('balloon'),
      export: this.getBaseVariable('export'),
      startDuration: startDuration,
      dataProvider: data,
      valueAxes: valueAxes,
      graphs: graphs,
      categoryField: categoryField,
      categoryAxis: catAxis,
      zoomOutText: '',
    });
  }

  public getBasePieChart(data: Array<any>, balloonText: string, innerRadius: string, radius: string, labelText: string, labelsEnabled: boolean, titleField: string, valueField: string, colorField: string, labelColorField: string): any {
    return _.cloneDeep({
      type: 'pie',
      balloon: this.getBaseVariable('balloon'),
      export: this.getBaseVariable('export'),
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
