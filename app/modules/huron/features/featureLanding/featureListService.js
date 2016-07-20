(function () {
  'use strict';

  angular
    .module('Huron')
    .service('HuronFeaturesListService', HuronFeaturesListService);

  /* @ngInject */
  function HuronFeaturesListService($filter) {
    var service = {
      autoAttendants: autoAttendants,
      callParks: callParks,
      huntGroups: huntGroups,
      filterCards: filterCards,
      orderByFilter: orderByFilter
    };

    var formattedCard = {
      // 'cardName': '',
      // 'numbers': [],
      // 'featureName': '',
      // 'filterValue': ''
    };

    return service;

    function autoAttendants(data) {
      var formattedList = [];
      _.forEach(data.ceInfos, function (aa) {
        formattedCard.cardName = aa.name;
        formattedCard.numbers = _.pluck(aa.resources, 'number');
        formattedCard.id = aa.ceUrl.substr(aa.ceUrl.lastIndexOf('/') + 1);
        formattedCard.featureName = 'huronFeatureDetails.aa';
        formattedCard.filterValue = 'AA';
        formattedCard.hasDepends = false;
        formattedCard.dependsNames = [];
        formattedCard.hasReferences = false;
        formattedCard.referenceNames = [];
        formattedList.push(formattedCard);
        formattedCard = {};
      });

      _.forEach(data.dependsIds, function (ceid) {
        var cardToUpdateIndex = 0;
        _.forEach(formattedList, function (card, index) {
          if (ceid.aaID === card.id)
            cardToUpdateIndex = index;
        });
        _.forEach(ceid.dependants, function (dependant) {
          formattedList[cardToUpdateIndex].hasDepends = true;
          var dependName = '';
          _.forEach(formattedList, function (card) {
            if (card.id === dependant.refAaID) {
              dependName = card.cardName;
            }
          });
          formattedList[cardToUpdateIndex].dependsNames.push(dependName);

          var refCardIndex = 0;
          _.forEach(formattedList, function (refcard, refindex) {
            if (dependName === refcard.cardName)
              refCardIndex = refindex;
          });
          formattedList[refCardIndex].referenceNames.push(formattedList[cardToUpdateIndex].cardName);
          formattedList[refCardIndex].hasReferences = true;

        });

        formattedList[cardToUpdateIndex].dependsNames.sort(function (a, b) {
          return a.localeCompare(b);
        });

      });
      return orderByCardName(formattedList);
    }

    function callParks(data) {
      var formattedList = [];
      _.forEach(data.callparks, function (callPark) {
        formattedCard.cardName = callPark.name;
        formattedCard.id = callPark.uuid;
        formattedCard.startRange = callPark.startRange;
        formattedCard.endRange = callPark.endRange;
        formattedCard.memberCount = callPark.memberCount;
        formattedCard.featureName = 'huronFeatureDetails.cp';
        formattedCard.filterValue = 'CP';
        formattedList.push(formattedCard);
        formattedCard = {};
      });
      return orderByCardName(formattedList);
    }

    function huntGroups(data) {
      var formattedList = [];
      _.forEach(data, function (huntGroup) {
        formattedCard.cardName = huntGroup.name;
        formattedCard.numbers = _.pluck(huntGroup.numbers, 'number');
        formattedCard.memberCount = huntGroup.memberCount;
        formattedCard.id = huntGroup.uuid;
        formattedCard.featureName = 'huronFeatureDetails.hg';
        formattedCard.filterValue = 'HG';
        formattedList.push(formattedCard);
        formattedCard = {};
      });
      return orderByCardName(formattedList);
    }

    /*
     Card can be searched by cardName, numbers, and memberCount (if Hunt Group Card)
     Card can be filtered by the specifying the filterValue (ex: AA, HG, CP)
     */
    function filterCards(list, filterValue, filterText) {
      var filter = (filterValue === 'all') ? '' : filterValue;

      var cardsFilteredByName = $filter('filter')(list, {
        cardName: filterText,
        filterValue: filter
      });

      var cardsFilteredByNumber = $filter('filter')(list, {
        cardName: "!" + filterText,
        numbers: filterText,
        filterValue: filter
      });

      var cardsFilteredByMemberCount = $filter('filter')(list, {
        cardName: "!" + filterText,
        numbers: "!" + filterText,
        memberCount: filterText,
        filterValue: filter
      });
      return orderByFilter(cardsFilteredByName.concat(cardsFilteredByNumber, cardsFilteredByMemberCount));
    }

    function orderByCardName(list) {
      return _.sortBy(list, function (item) {
        //converting cardName to lower case as _.sortByAll by default does a case sensitive sorting
        return item.cardName.toLowerCase();
      });
    }

    function orderByFilter(list) {
      return _.sortBy(list, 'filterValue');
    }
  }
})();
