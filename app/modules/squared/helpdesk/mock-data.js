(function () {
  'use strict';

  var mockData = {
    use: true,
    users: [{
      "id": "ddb4dd78-26a2-45a2-8ad8-4c181c5b3f0a",
      "organization": {
        id: "ce8d17f8-1734-4a54-8510-fae65acc505e"
      },
      "userName": "tom.vasset+marvelhelpdesk@gmail.com",
      "displayName": "Tom Vasset",
      "phoneNumbers": [{
        "type": "work",
        "value": "+47 67 51 14 67"
      }, {
        "type": "mobile",
        "value": "+47 92 01 30 30"
      }]
    }, {
      "id": "335bf4a2-a09c-45ba-a72a-e3f1de613295",
      "organization": {
        "id": "ce8d17f8-1734-4a54-8510-fae65acc505e"
      },
      "userName": "jayScott@marvel.com",
      "displayName": "Jay Scott",
      "phoneNumbers": []
    }, {
      "id": "2f4c85f7-e827-4b28-b567-0e49693b3f75",
      "organization": {
        "id": "ce8d17f8-1734-4a54-8510-fae65acc505e"
      },
      "userName": "shamim.pirzada+marvelenduser@gmail.com",
      "displayName": "Shamim",
      "phoneNumbers": []
    }],
    orgs: [{
      "id": "ce8d17f8-1734-4a54-8510-fae65acc505e",
      "displayName": "Marvel Partners"
    }]
  };
  angular.module('Squared').constant('HelpdeskMockData', mockData);
}());
