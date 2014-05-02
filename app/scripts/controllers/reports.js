'use strict';

angular.module('wx2AdminWebClientApp')
	.controller('ReportsCtrl', ['$scope',
		function($scope) {

			var data = [{
				'eventName': 'Call-Terminated Success',
				'count': 156
			}, {
				'eventName': 'Calls-Cancelled Failure',
				'count': 212
			}, {
				'eventName': 'Calls-Cancelled Success',
				'count': 42
			}, {
				'eventName': 'Calls-Completed Failure',
				'count': 26
			}, {
				'eventName': 'Calls-Completed Success',
				'count': 133
			}, {
				'eventName': 'Calls-Created Success',
				'count': 202
			}, {
				'eventName': 'Calls-Declined Success',
				'count': 9
			},{
				'eventName': 'Calls-Left Success',
				'count': 270
			}];

			$scope.chart = AmCharts.makeChart('chartdiv', {
				'type': 'pie',
				'theme': 'none',
				'legend': {
					'markerType': 'circle',
					'position': 'right',
					'marginRight': 80,
					'autoMargins': false
				},
				'dataProvider': data,
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

		}
	]);