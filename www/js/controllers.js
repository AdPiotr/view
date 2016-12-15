angular.module('starter.controllers', [])

.controller('SettingsCtrl', function($scope, Bluetooth) {
	$scope.settings = {
		visible: Bluetooth.isVisible(),
		searching: Bluetooth.isSearching(),
	};
	Bluetooth.refreshList()
})

.controller('PeopleCtrl', function($scope, $rootScope, Chats, Bluetooth) {
	$scope.chats = Chats.list();
	$scope.refresh = Bluetooth.refreshList
	$rootScope.$on("newDevice", function(){
        $scope.$evalAsync(function () {
			$scope.chats = Chats.list();
		})
	});
})

.controller('ChatCtrl', function($scope, $rootScope, $stateParams, $interval, Chats) {
	$scope.$on('$ionicView.enter', function(e) {
		$scope.other = Chats.startChat($stateParams.chatId);
	})
	$scope.params = {}
	$scope.send = () => Chats.onInput($scope.params.message)
	$rootScope.$on("newMessage", function(){
        $scope.$evalAsync(function () {
			$scope.other = $scope.other;
		})
	});
});
