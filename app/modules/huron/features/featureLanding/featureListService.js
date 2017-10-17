(function () {
  'use strict';

  angular
    .module('Huron')
    .service('HuronFeaturesListService', HuronFeaturesListService);

  /* @ngInject */
  function HuronFeaturesListService() {
    var service = {
      autoAttendants: autoAttendants,
      callParks: callParks,
      huntGroups: huntGroups,
      pagingGroups: pagingGroups,
      pickupGroups: pickupGroups,
      filterCards: filterCards,
      orderByFilter: orderByFilter,
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
        formattedCard.numbers = _.map(aa.resources, 'number');
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
          if (ceid.aaID === card.id) {
            cardToUpdateIndex = index;
          }
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
            if (dependName === refcard.cardName) {
              refCardIndex = refindex;
            }
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
      _.forEach(data, function (callPark) {
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
        formattedCard.numbers = _.map(huntGroup.numbers, 'number');
        formattedCard.memberCount = huntGroup.memberCount;
        formattedCard.id = huntGroup.uuid;
        formattedCard.featureName = 'huronFeatureDetails.hg';
        formattedCard.filterValue = 'HG';
        formattedList.push(formattedCard);
        formattedCard = {};
      });
      return orderByCardName(formattedList);
    }

    function pagingGroups(data) {
      var formattedList = [];
      _.forEach(data, function (pagingGroup) {
        formattedCard.cardName = pagingGroup.name;
        formattedCard.pgNumber = _.get(pagingGroup, 'extension.number', '');
        formattedCard.memberCount = pagingGroup.memberCount;
        formattedCard.id = pagingGroup.groupId;
        formattedCard.featureName = 'huronFeatureDetails.pg';
        formattedCard.filterValue = 'PG';
        formattedList.push(formattedCard);
        formattedCard = {};
      });
      return orderByCardName(formattedList);
    }

    function pickupGroups(data) {
      var formattedList = [];
      _.forEach(data, function (pickupGroup) {
        formattedCard.cardName = pickupGroup.name;
        formattedCard.memberCount = pickupGroup.memberCount;
        formattedCard.id = pickupGroup.uuid;
        formattedCard.featureName = 'huronFeatureDetails.pi';
        formattedCard.filterValue = 'PI';
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
      var filterStringProperties = [
        'cardName',
        'startRange',
        'endRange',
        'pgNumber',
        'memberCount',
      ];
      var filteredList = _.filter(list, function (feature) {
        if (feature.filterValue !== filterValue && filterValue !== 'all') {
          return false;
        }
        if (_.isEmpty(filterText)) {
          return true;
        }
        var matchedStringProperty = _.some(filterStringProperties, function (stringProperty) {
          return _.includes(_.get(feature, stringProperty), filterText);
        });
        var matchedNumbers = _.some(feature.numbers, function (number) {
          return _.includes(number, filterText);
        });
        return matchedStringProperty || matchedNumbers;
      });
      return orderByFilter(filteredList);
    }

    function orderByCardName(list) {
      return _.sortBy(list, function (item) {
        //converting cardName to lower case as _.sortBy by default does a case sensitive sorting
        if (item.cardName) {
          return item.cardName.toLowerCase();
        }
      });
    }

    function orderByFilter(list) {
      return _.sortBy(list, 'filterValue');
    }
  }
})();
