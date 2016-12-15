angular.module('starter.chats', [])

.factory('Chats', function(Bluetooth, $rootScope) {
	
	var chats = []
	var currentChat = { chat: [] }
	
	function updateChats() {
		var devices = Bluetooth.list();
		chats = []
		for(addr in devices){
			var device = devices[addr]
			chats.push({
				name: device.name,
				address: device.address,
				paired: device.paired,
				chat: [],
			})
		}
	}
	
	Bluetooth.onMessage(message => {
		currentChat.chat.push({owner: "his", text: message.text})
		$rootScope.$broadcast("newMessage");
	})

	return {
        // zwraca liste wszystkich czatow
		list: function() {
			updateChats()
			return chats;
		},
        // zwraca konkretny czat
		startChat: function(addr) {
			updateChats()
			for(chat of chats) {
				if(chat.address == addr){
					Bluetooth.connect(addr)
					currentChat = chat
					return chat;
				}
			}
			currentChat = chats[0]
			return chats[0];
		},
        // zostaje odpalony kiedy ma zostac wyslana wiadomosc do rozmowcy
        onInput: function(text) {
            Bluetooth.send({
				type: "text",
				text: text,
			})
			currentChat.chat.push({owner: "your", text: text})
        }
	};
});
