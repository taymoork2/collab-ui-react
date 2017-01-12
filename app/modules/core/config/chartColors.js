(function () {
  'use strict';

  var chartColors = {
    // Toolkit Colors
    attentionBase: '#F5A623',
    brandWhite: '#FFFFFF',
    ctaBase: '#43A942',
    ctaLight: '#8BCA8A',
    ctaLighter: '#D4ECD4',
    grayDarkFour: '#292929',
    grayDarkThree: '#343537',
    grayDarkTwo: '#4F5051',
    grayDarkOne: '#6a6b6c',
    grayBase: '#858688',
    grayLightOne: '#AEAEAF',
    grayLightTwo: '#D7D7D8',
    grayLightThree: '#EBEBEC',
    grayLightFour: '#F5F5F6',
    negativeBase: '#F5483F',
    peopleBase: '#14A792',
    peopleLight: '#6ec9bc',
    peopleLighter: '#C9EBE6',
    primaryBase: '#049FD9',
    primaryDarker: '#0387B8',
    primaryLight: '#66C5E8',

    // Non-Toolkit Colors
    colorPurple: '#8E5ACF',
    colorLightGreen: '#43A942',
    colorLightGreenFill: '#017900',
    colorLightRed: '#F96452',
    colorLightRedFill: '#FF0000',
    colorLightYellow: '#F5A623',
    colorLightYellowFill: '#FFA200',
    dummyGray: '#ECECEC',
    dummyGrayFillDark: '#D7D7D8',
    dummyGrayFillDarker: '#AEAEAF',
    dummyGrayFillLight: '#F5F5F6',
    dummyGrayFillLighter: '#EBEBEC',
    dummyGrayLight: '#F3F3F3',
    gray: '#aaa',
    grayDarkest: '#444',
    grayLight: '#ccc',
    metricBlue: '#049FD9',
    metricDarkGreen: '#417505',
    metricsRed: '#D03D35',
    metricYellow: '#F5A623'
  };

  angular
    .module('Core')
    .value('chartColors', chartColors);

}());
