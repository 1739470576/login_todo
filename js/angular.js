var app = angular.module('myApp',[]);
	app.controller('myCtrl', function($scope, $http){
		$scope.login = function(){
			$http.post('/login').then(function(data){
				//if ()
			});
		};
	});