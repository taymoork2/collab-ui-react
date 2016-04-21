(function () {
  'use strict';

  angular
    .module('core.trial')
    .factory('TrialTimeZoneService', TrialTimeZoneService);

  function TrialTimeZoneService() {
    var service = {
      getTimeZones: getTimeZones
    };

    return service;

    ////////////////

    function getTimeZones() {
      return _getTimeZones();
    }

    function _getTimeZones() {
      return [{
        "label": "(GMT +12:00) Marshall Islands",
        "timeZoneId": "0",
        "timeZoneName": "Marshall Islands",
        "DCName": "SJC",
        "DCID": "PM"
      }, {
        "label": "(GMT -11:00) Samoa",
        "timeZoneId": "1",
        "timeZoneName": "Samoa",
        "DCName": "SJC",
        "DCID": "PM"
      }, {
        "label": "(GMT -10:00) Honolulu",
        "timeZoneId": "2",
        "timeZoneName": "Honolulu",
        "DCName": "SJC",
        "DCID": "PM"
      }, {
        "label": "(GMT -09:00) Anchorage",
        "timeZoneId": "3",
        "timeZoneName": "Anchorage",
        "DCName": "SJC",
        "DCID": "PM"
      }, {
        "label": "(GMT -08:00) San Francisco",
        "timeZoneId": "4",
        "timeZoneName": "San Francisco",
        "DCName": "SJC",
        "DCID": "PM"
      }, {
        "label": "(GMT -07:00) Arizona",
        "timeZoneId": "5",
        "timeZoneName": "Arizona",
        "DCName": "SJC",
        "DCID": "PM"
      }, {
        "label": "(GMT -07:00) Denver",
        "timeZoneId": "6",
        "timeZoneName": "Denver",
        "DCName": "SJC",
        "DCID": "PM"
      }, {
        "label": "(GMT -06:00) Chicago",
        "timeZoneId": "7",
        "timeZoneName": "Chicago",
        "DCName": "SJC",
        "DCID": "PM"
      }, {
        "label": "(GMT -06:00) Saskatchewan",
        "timeZoneId": "9",
        "timeZoneName": "Saskatchewan",
        "DCName": "SJC",
        "DCID": "PM"
      }, {
        "label": "(GMT -06:00) Mexico City",
        "timeZoneId": "8",
        "timeZoneName": "Mexico City",
        "DCName": "SJC",
        "DCID": "PM"
      }, {
        "label": "(GMT -05:00) New York",
        "timeZoneId": "11",
        "timeZoneName": "New York",
        "DCName": "IAD",
        "DCID": "VA"
      }, {
        "label": "(GMT -06:00) Indiana",
        "timeZoneId": "12",
        "timeZoneName": "Indiana",
        "DCName": "IAD",
        "DCID": "VA"
      }, {
        "label": "(GMT -05:00) Bogota",
        "timeZoneId": "10",
        "timeZoneName": "Bogota",
        "DCName": "IAD",
        "DCID": "VA"
      }, {
        "label": "(GMT -04:30) Caracas",
        "timeZoneId": "133",
        "timeZoneName": "Caracas",
        "DCName": "IAD",
        "DCID": "VA"
      }, {
        "label": "(GMT -04:00) Halifax",
        "timeZoneId": "13",
        "timeZoneName": "Halifax",
        "DCName": "IAD",
        "DCID": "VA"
      }, {
        "label": "(GMT -04:00) La Paz",
        "timeZoneId": "14",
        "timeZoneName": "La Paz",
        "DCName": "IAD",
        "DCID": "VA"
      }, {
        "label": "(GMT -03:30) Newfoundland",
        "timeZoneId": "15",
        "timeZoneName": "Newfoundland",
        "DCName": "IAD",
        "DCID": "VA"
      }, {
        "label": "(GMT -03:00) Buenos Aires",
        "timeZoneId": "17",
        "timeZoneName": "Buenos Aires",
        "DCName": "IAD",
        "DCID": "VA"
      }, {
        "label": "(GMT +08:00) Beijing",
        "timeZoneId": "45",
        "timeZoneName": "Beijing",
        "DCName": "SIN",
        "DCID": "SG"
      }, {
        "label": "(GMT +08:00) Singapore",
        "timeZoneId": "47",
        "timeZoneName": "Singapore",
        "DCName": "SIN",
        "DCID": "SG"
      }, {
        "label": "(GMT +08:00) Taipei",
        "timeZoneId": "48",
        "timeZoneName": "Taipei",
        "DCName": "SIN",
        "DCID": "SG"
      }, {
        "label": "(GMT +09:00) Tokyo",
        "timeZoneId": "49",
        "timeZoneName": "Tokyo",
        "DCName": "SIN",
        "DCID": "SG"
      }, {
        "label": "(GMT +09:00) Seoul",
        "timeZoneId": "50",
        "timeZoneName": "Seoul",
        "DCName": "SIN",
        "DCID": "SG"
      }, {
        "label": "(GMT +08:00) Perth",
        "timeZoneId": "46",
        "timeZoneName": "Perth",
        "DCName": "SIN",
        "DCID": "SG"
      }, {
        "label": "(GMT +09:30) Darwin",
        "timeZoneId": "53",
        "timeZoneName": "Darwin",
        "DCName": "SIN",
        "DCID": "SG"
      }, {
        "label": "(GMT +10:00) Brisbane",
        "timeZoneId": "54",
        "timeZoneName": "Brisbane",
        "DCName": "SIN",
        "DCID": "SG"
      }, {
        "label": "(GMT +10:00) Sydney",
        "timeZoneId": "55",
        "timeZoneName": "Sydney",
        "DCName": "SIN",
        "DCID": "SG"
      }, {
        "label": "(GMT +11:00) Solomon Islands",
        "timeZoneId": "59",
        "timeZoneName": "Solomon Is",
        "DCName": "SIN",
        "DCID": "SG"
      }, {
        "label": "(GMT +12:00) Fiji",
        "timeZoneId": "61",
        "timeZoneName": "Fiji",
        "DCName": "SIN",
        "DCID": "SG"
      }, {
        "label": "(GMT +12:00) Wellington",
        "timeZoneId": "60",
        "timeZoneName": "Wellington",
        "DCName": "SIN",
        "DCID": "SG"
      }, {
        "label": "(GMT +09:00) Yakutsk",
        "timeZoneId": "51",
        "timeZoneName": "Yakutsk",
        "DCName": "SIN",
        "DCID": "SG"
      }, {
        "label": "(GMT +10:00) Guam",
        "timeZoneId": "56",
        "timeZoneName": "Guam",
        "DCName": "SIN",
        "DCID": "SG"
      }, {
        "label": "(GMT +10:00) Hobart",
        "timeZoneId": "57",
        "timeZoneName": "Hobart",
        "DCName": "SIN",
        "DCID": "SG"
      }, {
        "label": "(GMT +10:00) Vladivostok",
        "timeZoneId": "58",
        "timeZoneName": "Vladivostok",
        "DCName": "SIN",
        "DCID": "SG"
      }, {
        "label": "(GMT +05:30) Mumbai",
        "timeZoneId": "41",
        "timeZoneName": "Mumbai",
        "DCName": "SIN",
        "DCID": "SG"
      }, {
        "label": "(GMT +00:00) London",
        "timeZoneId": "21",
        "timeZoneName": "London",
        "DCName": "LNR",
        "DCID": "LN"
      }, {
        "label": "(GMT +00:00) Casablanca",
        "timeZoneId": "136",
        "timeZoneName": "Casablanca",
        "DCName": "LNR",
        "DCID": "LN"
      }, {
        "label": "(GMT +01:00) Paris",
        "timeZoneId": "23",
        "timeZoneName": "Paris",
        "DCName": "LNR",
        "DCID": "LN"
      }, {
        "label": "(GMT +01:00) Amsterdam",
        "timeZoneId": "22",
        "timeZoneName": "Amsterdam",
        "DCName": "LNR",
        "DCID": "LN"
      }, {
        "label": "(GMT +01:00) Prague",
        "timeZoneId": "24",
        "timeZoneName": "Prague",
        "DCName": "LNR",
        "DCID": "LN"
      }, {
        "label": "(GMT +01:00) Berlin",
        "timeZoneId": "25",
        "timeZoneName": "Berlin",
        "DCName": "LNR",
        "DCID": "LN"
      }, {
        "label": "(GMT +02:00) Bucharest",
        "timeZoneId": "27",
        "timeZoneName": "Bucharest",
        "DCName": "LNR",
        "DCID": "LN"
      }, {
        "label": "(GMT +02:00) Cairo",
        "timeZoneId": "28",
        "timeZoneName": "Cairo",
        "DCName": "LNR",
        "DCID": "LN"
      }, {
        "label": "(GMT +02:00) Athens",
        "timeZoneId": "26",
        "timeZoneName": "Athens",
        "DCName": "LNR",
        "DCID": "LN"
      }, {
        "label": "(GMT +02:00) Tel Aviv",
        "timeZoneId": "31",
        "timeZoneName": "Tel Aviv",
        "DCName": "LNR",
        "DCID": "LN"
      }, {
        "label": "(GMT +02:00) Helsinki",
        "timeZoneId": "30",
        "timeZoneName": "Helsinki",
        "DCName": "LNR",
        "DCID": "LN"
      }, {
        "label": "(GMT +02:00) Pretoria",
        "timeZoneId": "29",
        "timeZoneName": "Pretoria",
        "DCName": "LNR",
        "DCID": "LN"
      }, {
        "label": "(GMT +03:00) Nairobi",
        "timeZoneId": "34",
        "timeZoneName": "Nairobi",
        "DCName": "LNR",
        "DCID": "LN"
      }, {
        "label": "(GMT +03:00) Moscow",
        "timeZoneId": "33",
        "timeZoneName": "Moscow",
        "DCName": "LNR",
        "DCID": "LN"
      }, {
        "label": "(GMT +03:00) Riyadh",
        "timeZoneId": "32",
        "timeZoneName": "Riyadh",
        "DCName": "LNR",
        "DCID": "LN"
      }, {
        "label": "(GMT +03:00) Tehran",
        "timeZoneId": "35",
        "timeZoneName": "Tehran",
        "DCName": "LNR",
        "DCID": "LN"
      }, {
        "label": "(GMT +04:00) Abu Dhabi",
        "timeZoneId": "36",
        "timeZoneName": "Abu Dhabi, Muscat",
        "DCName": "LNR",
        "DCID": "LN"
      }, {
        "label": "(GMT +04:00) Muscat",
        "timeZoneId": "36",
        "timeZoneName": "Abu Dhabi, Muscat",
        "DCName": "LNR",
        "DCID": "LN"
      }, {
        "label": "(GMT +01:00) Oslo",
        "timeZoneId": "129",
        "timeZoneName": "Oslo",
        "DCName": "LNR",
        "DCID": "LN"
      }, {
        "label": "(GMT +01:00) Stockholm",
        "timeZoneId": "130",
        "timeZoneName": "Stockholm",
        "DCName": "LNR",
        "DCID": "LN"
      }];
    }
  }
})();
