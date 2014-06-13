
/* global AmCharts */

angular.module('wx2AdminWebClientApp')
.controller('HomeCtrl', ['$scope', 'ReportsService', 'Log',
	function($scope, ReportsService, Log) {

		var searchData;
		$('#au-graph-refresh').html('<i class=\'fa fa-refresh fa-spin fa-2x\'></i>');
		$('#au-refresh').html('<i class=\'fa fa-refresh fa-spin fa-2x\'></i>');
		$('#calls-refresh').html('<i class=\'fa fa-refresh fa-spin fa-2x\'></i>');
		$('#convo-refresh').html('<i class=\'fa fa-refresh fa-spin fa-2x\'></i>');
		$('#share-refresh').html('<i class=\'fa fa-refresh fa-spin fa-2x\'></i>');

		$('#activeUsersChart').addClass('chart-border');

		$scope.showAUGraphRefresh = false;
		$scope.showAURefresh = true;
		$scope.showCallsRefresh = true;
		$scope.showConvoRefresh = true;
		$scope.showShareRefresh = true;

		$scope.showAUGraph = true;
		$scope.showAUContent = false;
		$scope.showCallsContent = false;
		$scope.showConvoContent = false;
		$scope.showShareContent = false;

		var getActiveUsersCount = function()
		{
			ReportsService.activeUsersCount(function(data, status)
			{
				if (data.success) {
					if (data.length !== 0)
					{
						$scope.showAURefresh = false;
						$scope.showAUContent = true;
						$scope.activeUserCount = data.count;
					}
					else
					{
						$('#au-refresh').html('<span>No results available.</span>');
					}
				} else {
					Log.debug('Query active users failed. Status: ' + status);
					$('#au-refresh').html('<span>Error processing request</span>');
				}
			});
		};

		var getCallMetrics = function()
		{
			ReportsService.callMetrics(function(data, status)
			{
				var callCount = 0;
				if (data.success) {
					if (data.length !== 0)
					{
						var calls = data.reportDetail;
						if (calls.length > 0)
						{
							for (var i = 0; i < calls.length; i++) {
								callCount += calls[i].count;
							}
						}
						$scope.showCallsRefresh = false;
						$scope.showCallsContent = true;

						$scope.callsCount = callCount;
					}
					else
					{
						$('#calls-refresh').html('<span>No results available.</span>');
					}
				} else {
					Log.debug('Query calls metrics failed. Status: ' + status);
					$('#calls-refresh').html('<span>Error processing request</span>');
				}
			});
		};

		var getConversationMetrics = function()
		{
			ReportsService.conversationMetrics(function(data, status)
			{
				var convoCount = 0;
				if (data.success) {
					if (data.length !== 0)
					{
						var convos = data.reportDetail;
						if (convos.length > 0)
						{
							for (var i = 0; i < convos.length; i++) {
								convoCount += convos[i].count;
							}
						}
						$scope.showConvoRefresh = false;
						$scope.showConvoContent = true;

						$scope.convoCount = convoCount;
					}
					else
					{
						$('#convo-refresh').html('<span>No results available.</span>');
					}
				} else {
					Log.debug('Query conversation metrics failed. Status: ' + status);
					$('#convo-refresh').html('<span>Error processing request</span>');
				}
			});
		};

		var getContentShareMetrics = function()
		{
			ReportsService.contentShareMetrics(function(data, status)
			{
				var cShareCount = 0;
				if (data.success) {
					if (data.length !== 0)
					{
						var cShares = data.reportDetail;
						if (cShares.length > 0)
						{
							for (var i = 0; i < cShares.length; i++) {
								cShareCount += cShares[i].count;
							}
						}
						$scope.showShareRefresh = false;
						$scope.showShareContent = true;

						$scope.cShareCount = cShareCount;
					}
					else
					{
						$('#share-refresh').html('<span>No results available.</span>');
					}
				} else {
					Log.debug('Query content share metrics failed. Status: ' + status);
					$('#share-refresh').html('<span>Error processing request</span>');
				}
			});
		};

		//var chart = makeChart(searchData);

		//chart.colors = ['#FFCCFF', '#B8DBFF','#FFFF99', '#C2FFC2', '#3399FF', '#FF6666', '#FFB870', '#FF6600', '#FF9E01', '#FCD202', '#F8FF01', '#B0DE09', '#04D215', '#0D8ECF', '#0D52D1', '#2A0CD0', '#8A0CCF', '#CD0D74', '#754DEB', '#DDDDDD', '#999999', '#333333', '#000000', '#57032A', '#CA9726', '#990000', '#4B0C25'];

		getActiveUsersCount();
		getCallMetrics();
		getConversationMetrics();
		getContentShareMetrics();


	}
]);
