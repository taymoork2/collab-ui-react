(function () {
  'use strict';

  angular
    .module('Huron')
    .service('HuronFeaturesListService', HuronFeaturesListService);

  /* @ngInject */
  function HuronFeaturesListService($q, TelephoneNumberService) {
    var service = {
      autoAttendants: autoAttendants,
      callParks: callParks,
      huntGroups: huntGroups
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
      return formattedList;
    }

    function callParks() {
      // TODO: Add callpark formatting service
    }

    function huntGroups(data) {
      var formattedList = [];
      _.forEach(data.items, function (huntGroup) {
        formattedCard.cardName = huntGroup.name;
        formattedCard.numbers = huntGroup.numbers.map(function (number) {
          return TelephoneNumberService.getDIDLabel(number);
        });
        formattedCard.memberCount = huntGroup.memberCount;
        formattedCard.huntGroupId = huntGroup.uuid;
        formattedCard.featureName = 'huronHuntGroup.hg';
        formattedCard.filterValue = 'HG';
        formattedList.push(formattedCard);
        formattedCard = {};
      });
      return formattedList;
    }

  }
})();
