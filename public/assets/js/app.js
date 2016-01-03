emaApp = angular.module('emaApp', ['ngRoute']);

emaApp.config(function($routeProvider) {
	$routeProvider
		.when('/dashboard', {
			'controller': 'DashboardController',
			'templateUrl': '/views/dashboard.html'
		})
		.otherwise({redirectTo: '/dashboard'});
});

emaApp.controller('DashboardController', [ '$scope', '$http', function($scope, $http) {

	$scope.getStreams = function() {
		console.log("call all the streams");
		var stream;
		$http.post('/streams', stream).success(function(response) {
			console.log(response);
		});
	};




		//getAllStreams();

//	console.log(google);

	 //google.load("visualization", "1", {packages:["corechart"]});

 //    google.setOnLoadCallback(drawChart);

 //    function drawChart() {
 //        var data = new google.visualization.DataTable();

 //        data.addColumn('number', 'Day');
 //        data.addColumn('number', 'Guardians of the Galaxy');
 //        data.addColumn('number', 'The Avengers');
 //        data.addColumn('number', 'Transformers: Age of Extinction');

 //        data.addRows([
 //            [1,  37.8, 80.8, 41.8],
 //            [2,  30.9, 69.5, 32.4],
 //            [3,  25.4,   57, 25.7],
 //            [4,  11.7, 18.8, 10.5],
 //            [5,  11.9, 17.6, 10.4],
 //            [6,   8.8, 13.6,  7.7],
 //            [7,   7.6, 12.3,  9.6],
 //            [8,  12.3, 29.2, 10.6],
 //            [9,  16.9, 42.9, 14.8],
 //            [10, 12.8, 30.9, 11.6],
 //            [11,  5.3,  7.9,  4.7],
 //            [12,  6.6,  8.4,  5.2],
 //            [13,  4.8,  6.3,  3.6],
 //            [14,  4.2,  6.2,  3.4]
 //        ]);

 //        var options = {
 //            chart: {
 //              title: 'Box Office Earnings in First Two Weeks of Opening',
 //              subtitle: 'in millions of dollars (USD)'
 //            },
 //            width: '100%',
 //            height: '100%',
 //            legend: { position: 'bottom' }

 //        };


 //        var chart_lines = new google.visualization.LineChart(document.getElementById('chart-content'));

 //        chart_lines.draw(data, options);
 //    }


}]);
