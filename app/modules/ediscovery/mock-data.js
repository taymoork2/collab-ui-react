(function () {
  'use strict';

  function EdiscoveryMockData($interval) {
    var alive = false;
    var reports = [];

    var report = {
      "id": "e882dd0e-b86c-4d93-9246-dd6d11ac3452",
      "orgId": "1eb65fdf-9643-417f-9974-ad72cae0e10f",
      "createdByUserId": "50df7b9a-b046-4dbb-897b-229d63a524d2",
      "state": "COMPLETED",
      "downloadUrl": "https://avalon-integration.wbx2.com/avalon/api/v1/audit/rooms/396dbfb0-3238-11e6-9f82-c97e9d5e622d/contents?path=https%3A//files-api-integration.wbx2.com/v1/spaces/a72ad34c-c5df-44d2-bcc4-eb30942c6ca6/contents/86095a5b-a7ea-42e9-8dc3-1a248506ccc6/versions/20373cf5c8454d5fa9d51caacbcff2f8/bytes&scr=eyJlbmMiOiJBMjU2R0NNIiwiYWxnIjoiZGlyIn0..Kx-zr2tyVLjh7SnU.XaZDtdh7aG8mmXvkbDgbO9nIx_xy7QQNXnS7wxFEnVBNrr__hmfcVzarPfwz7Gp1w2ffIQ0zLj747jk04_KgVrsex4g-OuCSh5YmiJz5XlhAPnBBghZIhproJ3nQsGxwv4EaYBeKLCMUbjR0zC7gh2pWirKI5zynPz3Y4wLpOgPAdMmMWHKl9Hmifb-MztSornagMxgw15yU5mRn9yMIehi7TD4WQiNRdTdDhIjCP7jcX9q23iVjdT0XkuKdhwN32LKErR7wVtbtL0Gytgw_GfoePCf27mc55VDGOeTezD4TdlrvYaL_Kc90kYC8izVnqY8l3k59eppTUyyo8zknRG8lMPmaZMyNgjnRUuDaMTN_3nOekxA6pSEVVpujExkXjRGj_3U9RNRThzT6sPI_IuSWNiGCpRTOOWNNrUtFOshF480iyQAbgUmVYa2wlh5hao9UJFgk0Zv-Iuvio9KPea5IVA.8lflV_AvIO039CHij-mUFA",
      "createdTime": "2016-06-21T06:57:42.926Z",
      "expiryTime": "2016-07-01T06:57:43.636Z",
      "sizeInBytes": 4334,
      "displayName": "Test Avalon Conv",
      "lastUpdatedTime": "2016-06-21T06:57:43.645Z",
      "progress": 100,
      "type": "ROOM_QUERY",
      "roomQuery": {
        "startDate": "2016-06-13T00:00:00.000Z",
        "endDate": "2016-06-14T00:00:00.000Z",
        "roomId": "396dbfb0-3238-11e6-9f82-c97e9d5e622d"
      },
      "runUrl": "https://avalon-integration.wbx2.com/avalon/api/v1/compliance/report/room",
      "url": "https://atlas-integration.wbx2.com/admin/api/v1/compliance/organizations/1eb65fdf-9643-417f-9974-ad72cae0e10f/reports/e882dd0e-b86c-4d93-9246-dd6d11ac3452",
      "timeoutDetected": false
    };

    function getReport(id) {
      var report = _.find(reports, function (report) {
        return report.id === id;
      });
      if (report) {
        return {
          data: _.cloneDeep(report),
          status: 200
        };
      } else {
        //TODO: Fix.
        //console.log("Report not found is not handled.");
      }
    }

    var totalNrOfReports = 1000;

    function updateReportsProgress() {
      var staleIndex = 0;
      _.each(reports, function (report) {
        if (staleIndex++ % 5) {
          if (report.progress === 100 && report.state != "COMPLETED") {
            report.state = "COMPLETED";
            var now = moment();
            report.expiryTime = moment(now).add(2, 'minutes').utc().format();
          }
          if (report.progress === 100) {
            report.state = "COMPLETED";
          } else {
            report.state = "RUNNING";
            report.progress = report.progress + Math.floor(Math.random() * 5) + 1;
            if (report.progress > 100) {
              report.progress = 100;
            }
          }
          report.lastUpdatedTime = moment().format();
        }

      });
    }

    function getReports(offset, limit) {
      if (!alive) {
        reports = createAllMockReports(totalNrOfReports);
        $interval(updateReportsProgress, 1000);
        alive = true;
      }
      var reportSubset = reports.slice(offset, offset + limit);
      var response = {
        data: {
          reports: _.cloneDeep(reportSubset),
          paging: {
            count: totalNrOfReports,
            limit: limit,
            next: "n.a", // not applicable for mock
            offset: offset
          }
        },
        status: 200
      };
      return response;
    }

    function createAllMockReports(nrOfReports) {
      var reports = [];
      for (var i = 0; i < nrOfReports; i++) {
        report.id = "e882dd0e-b86c-4d93-9246-" + i;
        report.displayName = "Mock report #" + i;
        report.lastUpdatedTime = new Date().getTime();
        report.roomQuery.startDate = moment(moment()).subtract(2 + i, 'day').utc().format();
        report.roomQuery.endDate = moment(moment()).add(1 + i, 'day').utc().format();

        if (Math.floor(Math.random() > 0.5)) {
          report.progress = 0;
          report.state = "ACCEPTED";
        } else {
          report.progress = Math.floor(Math.random() * 90) + 1;
          report.state = "RUNNING";
        }

        reports.push(_.cloneDeep(report));
      }
      return reports;
    }

    return {
      getReports: getReports,
      getReport: getReport
    };
  }

  angular.module('Ediscovery').service('EdiscoveryMockData', EdiscoveryMockData);
}());
