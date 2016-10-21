ReferencePlayer.AddOns = ReferencePlayer.AddOns || {};
ReferencePlayer.AddOns.LBA = function() {

	var getPlayer = function () {
		return playerWrapper.getPlayer();
	},

	/**
	 * Alternate Audio Update event handler. Triggered when alternate audio tracks are detected or change.
	 * Enabled the alternate audio UI controls.  Note, event is dispatched if the stream contains a
	 * single audio track too.
	 * @param event
	 */
	onAudioUpdateEvent = function(event)
	{
		/* Don't enable audio UI controls if stream contains only single audio track */
		if (event.item.audioTracks.length <= 1)
			return;

		var optAATracks;

		var btnSettings = document.getElementById("btn_settings");
		btnSettings.classList.remove("invisible");

		if (!settingsManager.containsSetting("aa_track")) {
			// add audio track settings to settings manager
			var trackSetting = new ReferencePlayer.SettingsManager.Setting();
			trackSetting.id = "aa_track";
			trackSetting.name = "Alternate Audio Tracks";
			trackSetting.settingsDOM = document.getElementById("audio-select-panel");

			// create select element to hold track options
			trackSetting.settingsDOM = document.createElement("DIV");
			trackSetting.settingsDOM.id = "audio-select-panel";
			trackSetting.settingsDOM.classList.add("settings-panel");
			trackSetting.settingsDOM.setAttribute("hidden", "true");

			var label = document.createElement("LABEL");
			label.innerHTML = trackSetting.name;
			trackSetting.settingsDOM.appendChild(label);

			optAATracks = document.createElement("SELECT");
			optAATracks.id = "opt_aa_track";
			optAATracks.size = 4;
			optAATracks.addEventListener("change", function() {
				selectAudioTrack(this.options[this.selectedIndex].value);
			});

			trackSetting.settingsDOM.appendChild(optAATracks);

			settingsManager.register(trackSetting);
		}

		if (optAATracks === undefined) {
			optAATracks = document.getElementById("opt_aa_track");
		}

		optAATracks.classList.remove("hidden");
	//    trackSetting.settingsDOM.setAttribute("hidden", "false");

		// remove old options
		optAATracks.options.length = 0;

		for (var i = 0; i < event.item.audioTracks.length; i++)
		{
			var text = event.item.audioTracks[i].name + ", " + event.item.audioTracks[i].language;
			var option = new Option(text, i); // set option value to index in array
			if (event.item.audioTracks[i]._default)
			{
				option.selected = true;
			}
			optAATracks.options[optAATracks.options.length] = option;
		}
	},

	enableLateBoundAudio = function () {
		// can only be enabled if additional controls have been added
		if (isVideoControlsEnabled() == false)
			return;

		getPlayer().addEventListener(AdobePSDK.MediaPlayer.Events.AudioUpdatedEvent, onAudioUpdateEvent);
        getPlayer().addEventListener(AdobePSDK.MediaPlayer.Events.StatusChangeEvent, this.onStatusChange.bind(this));
	},

    onStatusChange = function(event)
    {
        if (event.status === AdobePSDK.MediaPlayerStatus.PREPARED) {
            checkAudioTracks.call(this);
        }
    },

    checkAudioTracks = function () {
         var item = getPlayer().currentItem;
         if (item)
         {
            var tracks = item.audioTracks;
            if (tracks && tracks.length > 0) {
                onAudioUpdateEvent.call(this, {item:item});
            }
         }

    },

	selectAudioTrack = function (trackIndex)
	{
		var index = parseInt(trackIndex);
		if (!isNaN(index))
		{
			var item = getPlayer().currentItem;
			if (item !== AdobePSDK.PSDKErrorCode.kECIllegalState)
			{
				var tracks = item.audioTracks;
				if (index >= 0 && index < tracks.length)
				{
					item.selectAudioTrack(tracks[index]);
				}
				else
				{
					console.log("ReferencePlayer.selectAudioTrack : Index out of bounds.");
				}
			}
		}
		else
		{
			console.log("ReferencePlayer.selectAudioTrack : Invalid argument");
		}
	};

	return {
		enableLateBoundAudio: enableLateBoundAudio,
		onStatusChange : onStatusChange,
		selectAudioTrack: selectAudioTrack
	}
};
