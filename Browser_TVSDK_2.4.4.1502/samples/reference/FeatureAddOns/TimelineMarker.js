ReferencePlayer.AddOns = ReferencePlayer.AddOns || {};
ReferencePlayer.AddOns.TimelineMarker = function() {
	var adMarkerHalfSize = 2, // must be half width of adMarker defined in CSS
	id = 0,
	previousLocalRange,
	getPlayer = function() {
		return playerWrapper.getPlayer();
	},
	/**
	* if duration of an AdItem and duration of current player (range.duration)
	* are same then it means that player is for only Ad playing.
	*/
	isAdOnlyPlayer = function(timelineMarkers)	{
		var range = getPlayer().playbackRange;
		if(!(range !== null && typeof range === 'object') || (range.begin === 0 && range.end === 0))
		{
			return true;
		}
		var localDuration;
		var timeline = getPlayer().timeline;
		if (timeline) {
			var localBegin = timeline.convertToLocalTime (range.begin);
			var localEnd = timeline.convertToLocalTime (range.end);
			localDuration = localEnd - localBegin;
		} else {
			localDuration = range.duration;
		}
		for(var i = 0; i < timelineMarkers.length; i++)
		{
			var adItems = timelineMarkers[i].items;
			for(var j = 0; j < adItems.length ; j++)
			{
				if(adItems[j].duration === localDuration)
				{
					return true;
				}
			}
		}
		return false;
	},

	cleanup = function() {
		//remove all old markers
		id = 0;
		var oldTimelineMarkers = document.getElementsByClassName("adMarker");
		while(oldTimelineMarkers[0])
		{
    		oldTimelineMarkers[0].parentNode.removeChild(oldTimelineMarkers[0]);
    	}
	},

	addTimelineMarker = function (time, range, backerElm) {
		//time is in local
		id++;
		var pos = convertTimeToRelativePosition(time, range);
		setPosition(pos, backerElm);
	},

	redrawTimelineMarkers = function(timelineMarkers)
	{
		cleanup();
		if(!isAdOnlyPlayer(timelineMarkers))
		{
    		updateTimelineMarkersInUI(timelineMarkers);
		}
	},

	onTimelineUpdatedEvent = function(event) {
		redrawTimelineMarkers(event.timeline.timelineMarkers);
	},

	onTimeChangeEvent = function(event)	{
		//In case of DVR slide, slide the timelineMarkers also accordingly.
		var isLive = ReferencePlayer.AddOns.PlayerControls.isLive();

        if (isLive)	{
			var timeline = getPlayer().timeline,
	        range = getPlayer().playbackRange,
	        localBegin,
	        localDuration;
			if (timeline) {
				localBegin = timeline.convertToLocalTime (range.begin);
				var localEnd = timeline.convertToLocalTime (range.end);
				localDuration = localEnd - localBegin;
			} else {
				localBegin = range.begin;
				localDuration = range.duration;
			}

        	if (previousLocalRange && !(previousLocalRange.begin === localBegin && previousLocalRange.duration === localDuration)) {
	        	//handing the case of dvr slide
	            //range has been updated. So, update things those needs to be updated on seekbar. For example: timelinemarkers
	            var timelineMarkers = timeline.timelineMarkers;
	            redrawTimelineMarkers(timelineMarkers);
        	}
        	previousLocalRange = new AdobePSDK.TimeRange (localBegin, localDuration);
        }
	},

	updateTimelineMarkersInUI = function(timelineMarkers) {
		var backerElm = document.getElementById("backer");
		var range = getPlayer().playbackRange;
		var isLive = getPlayer().currentItem.isLive;
		for(var i = 0; i < timelineMarkers.length; i++)
		{
			var adPolicy = (isLive || !timelineMarkers[i].isWatched);
			//this adPolicy needs to be in sync with ad policy being implemented.
			if(adPolicy)
			{
				addTimelineMarker(timelineMarkers[i].localRange.begin, range, backerElm);
			}
		}
	},

	convertTimeToRelativePosition = function (time, range) {
		//time is in local whereas range is in virtual
		var localBegin;
		var localDuration;
		var localTime;
		// Since time line shows local time, convert them to local times!
		var timeline = getPlayer().timeline;
		if (timeline) {
			localBegin = timeline.convertToLocalTime (range.begin);
			var localEnd = timeline.convertToLocalTime (range.end);
			localDuration = localEnd - localBegin;
			localTime = time;
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

	setPosition = function (percent, backerElm) {
		var newItem = document.createElement("div");
		newItem.className = "adMarker round";
		newItem.id = "adMarker_" + id;
		newItem.style.left = (percent * 100).toString() + "%";
		backerElm.parentNode.appendChild(newItem);
	};

	return {
		init : function() {
			cleanup();
			getPlayer().addEventListener(AdobePSDK.MediaPlayer.Events.TimelineUpdatedEvent, onTimelineUpdatedEvent);
			getPlayer().addEventListener(AdobePSDK.MediaPlayer.Events.TimeChangeEvent, onTimeChangeEvent);
		},
		cleanup : cleanup
	};
};
