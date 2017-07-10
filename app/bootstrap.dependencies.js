require('jquery');
require('angular');

angular.module('ng')
  .config(/* @ngInject */ function ($locationProvider, $qProvider) {
    // TODO: migrate towards html5 mode. Currently maintaining backwards compatibility
    // https://rally1.rallydev.com/#/detail/userstory/133819728820
    $locationProvider.hashPrefix('');
    // TODO: Revisit temporarily disabling 1.6 feature of reporting unhandled rejections
    // https://github.com/christopherthielen/ui-router-extras/issues/356
    // https://rally1.rallydev.com/#/detail/userstory/133821369776
    $qProvider.errorOnUnhandledRejections(false);
  });
