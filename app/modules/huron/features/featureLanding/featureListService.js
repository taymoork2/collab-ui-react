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
      orderByFilter: orderByFilter
    };

    var formattedCard = {
      // 'cardName': '',
      // 'numbers': [],
      // 'featureName': '',
      // 'filterValue': ''
    };

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
      return orderByCardName(formattedList);
    }

    function callParks() {
      // TODO: Add callpark formatting service
    }

    function huntGroups(data) {
      var formattedList = [];
      _.forEach(data, function (huntGroup) {
        formattedCard.cardName = huntGroup.name;
        formattedCard.numbers = huntGroup.numbers;
        formattedCard.memberCount = huntGroup.memberCount;
        formattedCard.id = huntGroup.uuid;
        formattedCard.featureName = 'huronHuntGroup.hg';
        formattedCard.filterValue = 'HG';
        formattedList.push(formattedCard);
        formattedCard = {};
      });
      return orderByCardName(formattedList);
    }

    function orderByCardName(list) {
      return _.sortBy(list, function (item) {
        //converting cardName to lower case as _.sortByAll by default does a case sensitive matching
        return item.cardName.toLowerCase();
      });
    }

    function orderByFilter(list) {
      return _.sortBy(list, 'filterValue');
    }
  }
})();
