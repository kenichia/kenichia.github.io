ReferencePlayer.AddOns = ReferencePlayer.AddOns || {};
ReferencePlayer.AddOns.ID3 = function() {
	var id3MarkerHalfSize = 2, // must be half width of ID3 defined in CSS
	_id3Tracker = ReferencePlayer.AddOns.ID3AdTracker ? new ReferencePlayer.AddOns.ID3AdTracker() : undefined,
	SHOW_MARKER_WINDOW = 5000, // Markers will be visible till SHOW_MARKER_WINDOW ms ahead of current head
	_timedMetadatas = [],
	_currentTime = 0,
	_tdParsing = false, // This variable is used as mutex if in future next call of onTimeChange is made before completion of previous

	getPlayer = function() {
		return playerWrapper.getPlayer();
	},

	cleanup = function() {
		//remove all old markers
		var old = document.getElementsByClassName("id3Marker");
		for(var i = 0; i < old.length; ){
			old[i].parentNode.removeChild(old[i]);
			old = document.getElementsByClassName("id3Marker");
		}
		_timedMetadatas = [];
	},

	compareTimedMetadata = function(a, b)
	{
		return a.td.time - b.td.time;
	},

	updateTimedMetadata = function(event)
    {
		var tdContainer = {td:event.timedMetadata, adTracking:false, visibleInUI:false, beginTime:0};
		_timedMetadatas.push(tdContainer);
		_timedMetadatas.sort(compareTimedMetadata);
    },

    deleteOldTimedMetadata = function() {
        var itemsDeleted = [];
        if (_timedMetadatas) {
        	var player = getPlayer();
            var playbackRange = player.playbackRange;
            var begin = playbackRange.begin;
            for (var i = 0; i < _timedMetadatas.length;) {
                var time = _timedMetadatas[i].td.time;
                if (time >= begin) {
                    return itemsDeleted;
                }
                itemsDeleted.push(_timedMetadatas.shift());
            }
        }
        return itemsDeleted;
    },

	onTimedMetadataEvent = function(event) {
		//cleanup();
		//var timedMetadataList = getPlayer().currentItem.timedMetadata;
    	updateTimedMetadata(event);

		updateMarkersInUI();
	},

	updateMarkersInUI = function() {
		var timedMetadataList = _timedMetadatas;
		if(!timedMetadataList || timedMetadataList.length == 0)
			return;

		itemsDeleted = deleteOldTimedMetadata();
		for(var i = 0; i < itemsDeleted.length; i++){
			removeID3Marker(itemsDeleted[i]);
		}

		var backerElm = document.getElementById("backer");
		for(var i = 0; i < timedMetadataList.length; i++){
			var td = timedMetadataList[i].td;
			if(td.type == AdobePSDK.TimedMetadataType.TAG || td.type == "TAG")
				continue;
			var time = td.time;
			if(_currentTime < (time-SHOW_MARKER_WINDOW)) {
				break;
			}
			//var range = event.target.getPlaybackRange();
			var player = getPlayer();
            var range = player.playbackRange;
			addID3Marker(time, range, backerElm, timedMetadataList[i]);
		}
	},

	onTimeChange = function(event) {
		if(_tdParsing === true) {
			return;
		}

		_tdParsing = true;
		_currentTime = event.time;
		var timedMetadataList = _timedMetadatas;
		if(!timedMetadataList || timedMetadataList.length == 0) {
			_tdParsing = false;
			return;
		}

		if(_id3Tracker) {
			_id3Tracker.id3Detected(_currentTime, timedMetadataList);
		}

		updateMarkersInUI();
		_tdParsing = false;
	},

	removeID3Marker = function(tdContainer) {
		var marker = document.getElementById("id3_" + tdContainer.td.id);
		if(marker) {
			marker.parentNode.removeChild(marker);
			tdContainer.visibleInUI = false;
		}
	},

	addID3Marker = function (time, range, backerElm, tdContainer) {
		if(tdContainer.visibleInUI === true) {
			if(tdContainer.beginTime == range.begin) {
				return;
			} else {
				// Removing the marker so that it is added as per new DVR window
				removeID3Marker(tdContainer);
			}
		}

		tdContainer.beginTime = range.begin;
		tdContainer.visibleInUI = true;
		var pos = convertTimeToRelativePosition(time, range);
		setPosition(pos, backerElm, tdContainer.td);
	},

	convertTimeToRelativePosition = function (time, range) {
		var localBegin;
		var localDuration;
		var localTime;

		// Since time line shows local time, convert them to local times!
		var timeline = getPlayer().timeline;
		if (timeline) {
			localBegin = timeline.convertToLocalTime (range.begin);
			var localEnd = timeline.convertToLocalTime (range.end);
			localDuration = localEnd - localBegin;
			localTime = timeline.convertToLocalTime (time);
		} else {
			localBegin = range.begin;
			localDuration = range.duration;
			localTime = time;
		}
		// convert time to a percentage of the duration
		var position = (localTime - localBegin) / localDuration;
		if (position > 1) position = 1;
		else if (position < 0) position = 0;
		return position;
	},

    hex2a = function (hex, offset, max) {
        var str = '';
        if(!hex)
            return str;
        for (var i = offset; i < hex.length && i < offset + max; i++)
            str += String.fromCharCode(hex[i]);
        return str;
    },

    setPosition = function (percent, backerElm, td) {
		// adjust to keep id3 marker inside container on right side
		var bounds = backerElm.getBoundingClientRect();
		var pos = percent * (bounds.right - bounds.left);

		var newItem = document.createElement("div");
		newItem.className = "id3Marker round";
		newItem.id = "id3_" + td.id;
		newItem.style.left = (pos-id3MarkerHalfSize).toString() + "px";
		backerElm.parentNode.appendChild(newItem);

		var md = td.metadata;
		var keySet = md.keySet;
		if(keySet && keySet.length){
			var msg = '';
			for(var j = 0; j < keySet.length; j++){
				var idTag = keySet[j];
				msg += idTag;
				if(idTag.indexOf("T") == 0){
					/* text frame : encoding byte + text data
    				 * 00=ASCII;01=UTF-16 Unicode with BOM;02=UTF-16BE Unicode without BOM
    				 * 03=UTF-8
    				 */
					var buff = md.getByteArray(idTag);
					msg += " : " + hex2a(buff, 1, buff.length-1);
				}
				msg += " ; ";
			}
			newItem.title = msg;
		}
	};

	return {
		init : function() {
			cleanup();
			getPlayer().addEventListener(AdobePSDK.MediaPlayer.Events.TimedMetadataEvent, onTimedMetadataEvent);
			getPlayer().addEventListener(AdobePSDK.MediaPlayer.Events.TimeChangeEvent, onTimeChange);
		},

		cleanup : cleanup
	};
};
