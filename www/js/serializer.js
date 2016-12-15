angular.module('starter.serializer', [])

.factory('Serializer', function() {
	
	function ab2str(buf) {
		return String.fromCharCode.apply(null, new Uint16Array(buf));
	}

	function str2ab(str) {
		var buf = new ArrayBuffer(str.length*2); // 2 bytes for each char
		var bufView = new Uint16Array(buf);
		for (var i=0, strLen=str.length; i<strLen; i++) {
			bufView[i] = str.charCodeAt(i);
		}
		return buf;
	}

	return {
		fromBytes: function(buffer) {
			return JSON.parse(ab2str(buffer))
			var ret = {}
			var pos = 0
            var typ = buffer.readInt8(pos)
			pos += 1;
			ret.bodyLength = buffer.readInt32LE(pos)
			pos += 4;
			if(typ == 0){
				ret.textLength = buffer.readInt32LE(pos)
				pos += 4;
				ret.text = buffer.toString('utf8', pos, pos + ret.textLength)
				pos += ret.textLength;
				ret.type = "text"
			}else{
				ret.fileNameLength = buffer.readInt32LE(pos)
				pos += 4;
				ret.fileName = buffer.toString('utf8', pos, pos + ret.fileNameLength)
				pos += ret.fileNameLength;
				ret.fileSize = buffer.readInt32LE(pos)
				pos += 4;
				ret.fileContent = Buffer.from(buffer.slice(pos, pos + ret.fileSize))
				pos += ret.fileSize;
				ret.type = "file"
			}
			return ret
		},
		toBytes: function(packet) {
			return str2ab(JSON.stringify(packet))
			var ret
			var pos = 0
			if(packet.type == "text") {
				var text = Buffer.from(packet.text)
				var ret = Buffer.alloc(text.length + 9)
				ret.writeInt8(0, pos)
				pos += 1;
				ret.writeInt32LE(ret.length - 5, pos)
				pos += 4;
				ret.writeInt32LE(text.length, pos)
				pos += 4;
				text.copy(ret, pos)
				pos += text.length;
			} else {
				var fileName = Buffer.from(packet.fileName)
				var fileContent = packet.fileContent
				var ret = Buffer.alloc(fileName.length + fileContent.length + 13)
				ret.writeInt8(1, pos)
				pos += 1;
				ret.writeInt32LE(ret.length - 5, pos)
				pos += 4;
				ret.writeInt32LE(fileName.length, pos)
				pos += 4;
				fileName.copy(ret, pos)
				pos += fileName.length;
				ret.writeInt32LE(fileContent.length, pos)
				pos += 4;
				fileContent.copy(ret, pos)
				pos += fileContent.length;
			}
			return ret
		}
	};
})
