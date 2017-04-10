export class ChartColors {
  /* @ngInject */
  constructor() {}

  // Toolkit Colors
  public readonly alertsBase: string = '#F96452';
  public readonly attentionBase: string = '#F5A623';
  public readonly brandWhite: string = '#FFFFFF';
  public readonly ctaBase: string = '#43A942';
  public readonly ctaLight: string = '#8BCA8A';
  public readonly ctaLighter: string = '#D4ECD4';
  public readonly grayDarkFour: string = '#292929';
  public readonly grayDarkThree: string = '#343537';
  public readonly grayDarkTwo: string = '#4F5051';
  public readonly grayDarkOne: string = '#6a6b6c';
  public readonly grayBase: string = '#858688';
  public readonly grayLightOne: string = '#AEAEAF';
  public readonly grayLightTwo: string = '#D7D7D8';
  public readonly grayLightThree: string = '#EBEBEC';
  public readonly grayLightFour: string = '#F5F5F6';
  public readonly negativeBase: string = '#F5483F';
  public readonly negativeDarker: string = '#D03D35';
  public readonly peopleBase: string = '#14A792';
  public readonly peopleLight: string = '#6ec9bc';
  public readonly peopleLighter: string = '#C9EBE6';
  public readonly primaryBase: string = '#049FD9';
  public readonly primaryDarker: string = '#0387B8';
  public readonly primaryLight: string = '#66C5E8';

  // Non-Toolkit Colors
  public readonly colorPurple: string = '#8E5ACF';
  public readonly colorLightGreenFill: string = '#017900';
  public readonly colorLightRedFill: string = '#FF0000';
  public readonly colorLightYellowFill: string = '#FFA200';
  public readonly gray: string = '#aaa';
  public readonly metricDarkGreen: string = '#417505';
}

export default angular
  .module('core.chartColors', [])
  .service('chartColors', ChartColors);
