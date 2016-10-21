Chromecast = (function() {
    "use strict";
	var FIRST_MSG = 10000;
    return {
        MSG_NAMESPACE: "urn:x-cast:com.adobe.primetime",
		
        MSG_TYPE: {
            LOAD: FIRST_MSG + 1,
            TOGGLE_PLAY_PAUSE: FIRST_MSG + 2,
            SEEK: FIRST_MSG + 3,
            ABSOLUTE_SEEK: FIRST_MSG + 4,
            VOLUME_CHANGE: FIRST_MSG + 5,
            FAST_FORWARD: FIRST_MSG + 6,
            FAST_REWIND: FIRST_MSG + 7,
            SLOW_FORWARD: FIRST_MSG + 8,
            SLOW_REWIND: FIRST_MSG + 9,
            REWIND: FIRST_MSG + 10,
            AUDIO_TRACK_CHANGE: FIRST_MSG + 11,
            CAPTIONS_TRACK_CHANGE: FIRST_MSG + 12,
            SEEK_TO_LIVE: FIRST_MSG + 13,
            CC_TOGGLE: FIRST_MSG + 14,
            RESET: FIRST_MSG + 15
        }
    };
}());