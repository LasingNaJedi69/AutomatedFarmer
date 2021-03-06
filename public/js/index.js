'use strict';

angular.module("indexApp", 
	["ngRoute",
	"autoFarm.controllers.manualCtrl",
	"autoFarm.controllers.autoCtrl",
	"autoFarm.controllers.activityCtrl",
	"autoFarm.controllers.gpsCtrl",
	"controllers.modalController",
	"angularjs-datetime-picker"])
.config(["$routeProvider", "$locationProvider",
	function($routeProvider, $locationProvider){
		
		// growlProvider.totalTimeToLive(3000);
		
		$routeProvider.when("/", {
			templateUrl	: "/partials/activityPage.html",
			controller 	: "activityCtrl"
		})
		.when("/manual", {
			templateUrl	: "/partials/manualPage.html",
			controller 	: "manualCtrl"
		})
		.when("/automated/autoPilot", {
			templateUrl	: "/partials/autoPilotPage.html",
			controller 	: "autoPilotCtrl"
		})
		.when("/automated", {
			templateUrl	: "/partials/autoChoosePage.html",
			controller 	: "autoCtrl"
		})
		.when("/automated/schedule/:lotid", {
			templateUrl	: "/partials/autoSchedulePage.html",
			controller 	: "autoCtrl"
		})
		.when("/automated/activity/:lotid", {
			templateUrl	: "/partials/autoControlPage.html",
			controller 	: "autoCtrl"
		})
		.when("/activities", {
			templateUrl	: "/partials/activityPage.html",
			controller 	: "activityCtrl"
		})
		.when("/gps", {
			templateUrl : "/partials/gpsTest.html",
			controller 	: "gpsCtrl"
		})
		.otherwise({
			template 	: "<h1>Page does not exist</h1>"
		});
	}
])
.controller("indexCtrl", ["$rootScope", "$scope", "$window", "$location", "$http",
	function($rootScope, $scope, $window, $location, $http){
		$scope.active = $location.url();
		$rootScope.autoPilot = {};
		$rootScope.socket = io('http://' + $location.host() + ':3000');
		// if(!$scope.hasSocket){
		// 	$rootScope.socket = io('http://' + $location.host() + ':3000');
		// 	$http({
		// 		method	: 'GET', 
		// 		url		: '/getSocketData'
		// 	}).then(function(res){
		// 		var hostAddress = res.data;
		// 		// $rootScope.socket.emit('event-ongoing');
		// 		// $rootScope.socket.on('is-ongoing', function(data){
		// 		// 	$rootScope.autoPilot.ongoing = data;
		// 		// 	console.log(data);
		// 		// });
		// 		console.log(res);
		// 	}, function(error){
		// 		console.log(error);
		// 	});
		// }
	}	
]);

// angular.service('crumbs', function(){
// 	var links = [];

// 	var addCrumb = function(key, value){
// 		links.push({

// 		})
// 	};

// 	var getCrumb = function(key){
// 		return links[key];
// 	};

// 	var getCrumbs = function(){
// 		return links;
// 	};

// 	return{
// 		addCrumb: addCrumb,
// 		getCrumb: getCrumb,
// 		getCrumbs: getCrumbs,
// 	};
// });
