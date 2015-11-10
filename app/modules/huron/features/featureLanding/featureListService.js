(function () {
  'use strict';

  angular
    .module('Huron')
    .service('HuronFeaturesListService', HuronFeaturesListService);

  /* @ngInject */
  function HuronFeaturesListService($q, $filter) {
    var service = {
      autoAttendants: autoAttendants,
      callParks: callParks,
      huntGroups: huntGroups,
      orderBy: orderBy
    };

    var formattedCard = {
      // 'cardName': '',
      // 'numbers': [],
      // 'featureName': '',
      // 'filterValue': ''
    };

    var orderByFilter = $filter('orderBy');

    return service;

    ////////////////

    function autoAttendants(data) {
      var formattedList = [];
      _.forEach(data.ceInfos, function (aa) {
        formattedCard.cardName = aa.name;
        formattedCard.numbers = _.pluck(aa.resources, 'number');
        formattedCard.id = aa.ceUrl.substr(aa.ceUrl.lastIndexOf('/') + 1);
        formattedCard.featureName = 'huronFeatureDetails.aa';
        formattedCard.filterValue = 'AA';
        formattedList.push(formattedCard);
        formattedCard = {};
      });
      return orderBy(formattedList, 'cardName');
    }

    function callParks() {
      // TODO: Add callpark formatting service
    }

    function huntGroups(data) {
      var formattedList = [];
      _.forEach(data.items, function (huntGroup) {
        formattedCard.cardName = huntGroup.name;
        formattedCard.numbers = huntGroup.numbers;
        formattedCard.memberCount = huntGroup.memberCount;
        formattedCard.huntGroupId = huntGroup.uuid;
        formattedCard.featureName = 'huronHuntGroup.hg';
        formattedCard.filterValue = 'HG';
        formattedList.push(formattedCard);
        formattedCard = {};
      });
      return orderBy(formattedList, 'cardName');
    }

    function orderBy(list, predicate) {
      return orderByFilter(list, predicate, false);
    }

  }
})();
