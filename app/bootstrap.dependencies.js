require('jquery');
require('angular');

angular.module('ng')
  .config(/* @ngInject */ function ($locationProvider) {
    // TODO: migrate towards html5 mode. Currently maintaining backwards compatibility
    // https://rally1.rallydev.com/#/detail/userstory/133819728820
    $locationProvider.hashPrefix('');
  });
