'use strict';
/* global AmCharts, $ */

angular.module('wx2AdminWebClientApp')
	.controller('ReportsCtrl', ['$scope', 'ReportsService', 'Log',
		function($scope, ReportsService, Log) {

			var searchData;
			$('#refresh').html('<i class=\'fa fa-refresh fa-spin fa-2x\'></i>');
			$('#chartdiv').addClass('chart-border');
			$scope.showRefresh = true;

			var getMetrics = function()
			{
				var params = {'intervalCount':1, 'intervalType':'month'};
				ReportsService.getUsageMetrics('callUsage', params, function(data, status)
				{
					if (data.success) {
						searchData = data.data;
						makeChart(searchData);
						if (searchData.length !== 0)
						{
							$scope.showRefresh = false;
							$('#chartdiv').removeClass('chart-border');
						}
						else
						{
							$('#refresh').html('<h3>No results available.</h3>');
						}
					} else {
						Log.debug('Query existing users failed. Status: ' + status);
						$('#refresh').html('<h3>Error processing request</h3>');
					}
				});
			};

			var makeChart = function(sdata) {
				var piChart = AmCharts.makeChart('chartdiv', {
					'type': 'pie',
					'theme': 'none',
					'legend': {
						'markerType': 'circle',
						'position': 'right',
						'marginRight': 80,
						'autoMargins': false
					},
					'dataProvider': sdata,
					'valueField': 'count',
					'titleField': 'eventName',
					'balloonText': '[[title]]<br><span style=\"font-size:14px\"><b>[[value]]</b> ([[percents]]%)</span>',
					'exportConfig': {
						'menuTop': '0px',
						'menuItems': [{
							'icon': '/lib/3/images/export.png',
							'format': 'png'
						}]
					}
				});
				return piChart;
			};

			var chart = makeChart(searchData);

			chart.colors = ['#FFCCFF', '#B8DBFF','#FFFF99', '#C2FFC2', '#3399FF', '#FF6666', '#FFB870', '#FF6600', '#FF9E01', '#FCD202', '#F8FF01', '#B0DE09', '#04D215', '#0D8ECF', '#0D52D1', '#2A0CD0', '#8A0CCF', '#CD0D74', '#754DEB', '#DDDDDD', '#999999', '#333333', '#000000', '#57032A', '#CA9726', '#990000', '#4B0C25'];

			getMetrics();

		}
	]);
