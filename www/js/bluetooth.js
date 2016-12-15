angular.module('starter.bluetooth', ['ionic'])

.factory('Bluetooth', function(Serializer, $ionicPlatform, $timeout, $rootScope, $state) {
	
	var uuid = '6a822aec-c0b2-11e6-a4a6-cec0c932ce01';
	var address
	var discovering = false
	var discoverable = false
	var devicesList = {}
	var serverSocket;
	var clientSocket;
	var onMessage = () => {};
	
	function addDevice(device) {
		devicesList[device.address] = device
		$rootScope.$broadcast("newDevice");
	}
	
	$ionicPlatform.ready(function() {
		networking.bluetooth.onAdapterStateChanged.addListener(function (adapterInfo) {
			address = adapterInfo.address
			name = adapterInfo.name
			discovering = adapterInfo.discovering
			discoverable = adapterInfo.discoverable
		});
		
		networking.bluetooth.onReceiveError.addListener(function (errorInfo) {
		    if (errorInfo.socketId !== socketId) {
		        return;
		    }
		    alert(errorInfo.errorMessage);
		});
		
		networking.bluetooth.listenUsingRfcomm(uuid, function (serverSocketId) {
			serverSocket = serverSocketId
		}, alert);
		
		networking.bluetooth.onAccept.addListener(function (acceptInfo) {
			clientSocket = acceptInfo.clientSocketId;
			$state.go("tab.chat", {"chatId": 123})
		});
		
		networking.bluetooth.onReceive.addListener(function (receiveInfo) {
			var data = Serializer.fromBytes(receiveInfo.data)
			onMessage(data)
		});
	})

	return {
        // wyszukuje na nowo niezparowane urzadzenia
		refreshList: function() {
			devicesList = {}
			$rootScope.$broadcast("newDevice");
			$ionicPlatform.ready(function() {
				networking.bluetooth.onDeviceAdded.addListener(addDevice);
				networking.bluetooth.startDiscovery()
				networking.bluetooth.getDevices(function (devices) {
				    for (device of devices) {
						addDevice(device)
				    }
				}, alert);
			})
		},
        // Wszystkie zparowane i niezparowane urzadzenia jako array:
		// address: String --> The address of the device, in the format 'XX:XX:XX:XX:XX:XX'.
        // name: String --> The human-readable name of the device.
        // paired: Boolean --> Indicates whether or not the device is paired with the system.
        // uuids: Array of String --> UUIDs of protocols, profiles and services advertised by the device.
        list: function() {
            return devicesList;
		},
        connect: function(addr) {
			networking.bluetooth.connect(addr, uuid, function (socketId) {
				clientSocket = socketId;
			}, alert);
        },
		send: function(packet) {
			var data = Serializer.toBytes(packet)
			networking.bluetooth.send(clientSocket, data);
		},
		onMessage: function(hook) {
			onMessage = hook
		},
        // widocznosc dla niezparowanych
        isVisible: function() {
            return discoverable
        },
        setVisible: function(visible) {
			if(visible){
            	networking.bluetooth.requestDiscoverable()
			}
        },
        // szukanie niezparowanych
        isSearching: function() {
            return discovering
        },
        setSearching: function(searching) {
            if(searching) {
				networking.bluetooth.startDiscovery()
			} else {
				networking.bluetooth.stopDiscovery()
			}
        },
        getName: function() {
            return name
        },
        setName: function(name) {
            
        },
	};
})
