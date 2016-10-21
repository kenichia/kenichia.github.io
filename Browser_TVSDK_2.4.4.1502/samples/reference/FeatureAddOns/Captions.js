ReferencePlayer.AddOns = ReferencePlayer.AddOns || {};
ReferencePlayer.AddOns.Captions = function() {

	var getPlayer = function () {
		return playerWrapper.getPlayer();
	},

	/**
	 * Closed Captions Update event handler. Triggered when closed captions tracks are detected or change.
	 * Enables the closed captions UI controls.
	 * @param event
	 */
	onCaptionsUpdateEvent = function(event)
	{
		// show closed captions toggle button
		var btnCC = document.getElementById("btn_captions");
		btnCC.classList.remove("invisible");

		var btnSettings = document.getElementById("btn_settings");
		btnSettings.classList.remove("invisible");

		var optCCTracks;

		if (!settingsManager.containsSetting("cc_track")) {
			// add captions track settings to settings manager
			var trackSetting = new ReferencePlayer.SettingsManager.Setting();
			trackSetting.id = "cc_track";
			trackSetting.name = "Closed Captions Tracks";

			// create select element to hold track options
			trackSetting.settingsDOM = document.createElement("DIV");
			trackSetting.settingsDOM.id = "captions-select-panel";
			trackSetting.settingsDOM.classList.add("settings-panel");
			trackSetting.settingsDOM.setAttribute("hidden", "true");

			var label = document.createElement("LABEL");
			label.innerHTML = trackSetting.name;
			trackSetting.settingsDOM.appendChild(label);

			optCCTracks = document.createElement("SELECT");
			optCCTracks.id = "opt_cc_track";
			optCCTracks.size = 4;
			optCCTracks.addEventListener("change", function() {
				selectCaptionsTrack(this.options[this.selectedIndex].value);
			});

			trackSetting.settingsDOM.appendChild(optCCTracks);

			settingsManager.register(trackSetting);
		}

		if (!settingsManager.containsSetting("cc_style")) {
			// add captions style settings to settings manager
			var captionsSettings = new ReferencePlayer.SettingsManager.ClosedCaptionsSettings(playerWrapper);
			var styleSetting = new ReferencePlayer.SettingsManager.Setting();
			styleSetting.id = "cc_style";
			styleSetting.name = "Closed Captions Styles";
			styleSetting.settingsDOM = captionsSettings.getDOM();
			styleSetting.hide = captionsSettings.hide;
			styleSetting.display = captionsSettings.display;
			settingsManager.register(styleSetting);
		}


		// decorate button if captions are enabled/disabled
		this.toggleCCButtonStyle(this.getCCVisibility());

		if (optCCTracks === undefined) {
			optCCTracks = document.getElementById("opt_cc_track");
		}

		// remove old options
		optCCTracks.options.length = 0;
		var eventData = event.item.closedCaptionsTracks;
		for (var i = 0; i < eventData.length; i++)
		{
			var text = eventData[i].name + " (" + eventData[i].language + ") [" + eventData[i].serviceType + "]";
			var option = new Option(text, i); // set option value to index in array
			/*
            NOTE
            We don't enable Closed Captions by default, hence the following code has no effect.
            But it does disable CC when there is only one Caption to select.
            if (eventData[i].isDefault)
            {
                option.selected = true;
            }
            */
			optCCTracks.options[optCCTracks.options.length] = option;
		}
	},

	/*
	 * Player StatusChange event listener. Installed here to detect updated  closed captions tracks
	 * for cases where CaptionsUpdate Event is not being received - VTT in Flash Player until the
	 * issue is resolved.
	 */
	onStatusChange = function(event)
	{
		if (event.status === AdobePSDK.MediaPlayerStatus.PREPARED) {
			var builder = new ReferencePlayer.TextFormatBuilder(getPlayer().ccStyle);
			builder.backgroundOpacity = "100";
			getPlayer().ccStyle = builder.build();

			this.checkClosedCaptions();
		}
	},

	checkClosedCaptions = function () {
		var item = getPlayer().currentItem;
		if (item)
		{
			var tracks = item.closedCaptionsTracks;
			if (tracks && tracks.length > 0) {
				this.onCaptionsUpdateEvent.call(this, {item:item});
			}
		}

	},

	/**
	 * Toggles UI style for the closed captions when the captions are turned on/off.
	 * @param visible {boolean}
	 */
	toggleCCButtonStyle = function (visible)
	{
		if (visible) {
			document.getElementById("btn_captions").classList.remove("captions-off");
		}
		else
		{
			document.getElementById("btn_captions").classList.add("captions-off");
		}
	},

	toggleCCVisibility = function()
	{
		if (this.getCCVisibility() === false)
		{
			getPlayer().ccVisibility = AdobePSDK.MediaPlayer.VISIBLE;
			return {visible: true};
		}
		else
		{
			getPlayer().ccVisibility = AdobePSDK.MediaPlayer.INVISIBLE;
			return {visible: false};
		}
	},

	getCCVisibility = function ()
	{
		var visibility = getPlayer().ccVisibility;
		return visibility === AdobePSDK.MediaPlayer.VISIBLE ? true : false;
	},

	getCCStyle = function ()
	{
		return getPlayer().ccStyle;
	},

	selectCaptionsTrack = function(trackIndex)
	{
		var index = parseInt(trackIndex);
		if (!isNaN(index))
		{
			var item = getPlayer().currentItem;
			if (item !== AdobePSDK.PSDKErrorCode.kECIllegalState)
			{
				var tracks = item.closedCaptionsTracks;
				if (index >= 0 && index < tracks.length)
				{
					item.selectClosedCaptionsTrack(tracks[index]);
				}
				else
				{
					console.log("ReferencePlayer.selectCaptionsTrack : Index out of bounds.");
				}
			}
		}
		else
		{
			console.log("ReferencePlayer.selectCaptionsTrack : Invalid argument");
		}
	},

	onAdBreakStarted = function(event)
	{
		disableCCControls();
	},

	onAdBreakCompleted = function(event)
	{
		enableCCControls();
	},

	disableCCControls = function ()
	{
		var btnCC = document.getElementById("btn_captions");
		btnCC.classList.add("captions-off");
		btnCC.disabled = true;

		var btnSettings = document.getElementById("btn_settings");
		btnSettings.classList.remove("on");
		btnSettings.disabled = true;

		var settingsContainer = document.getElementById("settings-container");
		settingsContainer.setAttribute("hidden", "true");
	},

	enableCCControls = function ()
	{
		var btnCC = document.getElementById("btn_captions");
		btnCC.disabled = false;

		var btnSettings = document.getElementById("btn_settings");
		btnSettings.disabled = false;
	},

	enableCaptions = function (isPIPPlayer) {
		// can only be added if additional controls are there
		if (isVideoControlsEnabled() === false)
			return;

		// Captions
		btnClosedCaptions = document.getElementById("btn_captions");
		btnClosedCaptions.addEventListener("click", function(isPIPPlayer)
		{
			if(isPIPPlayer) {
				return;
			}
			var result = this.toggleCCVisibility();
			this.toggleCCButtonStyle(result.visible);
		}.bind(this, isPIPPlayer));

		getPlayer().addEventListener(AdobePSDK.MediaPlayer.Events.CaptionsUpdatedEvent, this.onCaptionsUpdateEvent.bind(this));
		getPlayer().addEventListener(AdobePSDK.MediaPlayer.Events.StatusChangeEvent, this.onStatusChange.bind(this));
		getPlayer().addEventListener(AdobePSDK.MediaPlayer.Events.AdBreakStartedEvent, onAdBreakStarted);
		getPlayer().addEventListener(AdobePSDK.MediaPlayer.Events.AdBreakCompletedEvent, onAdBreakCompleted);

	}

	return {
		enableCaptions : enableCaptions,
		onCaptionsUpdateEvent : onCaptionsUpdateEvent,
		onStatusChange : onStatusChange,
		toggleCCButtonStyle : toggleCCButtonStyle,
		toggleCCVisibility : toggleCCVisibility,
		getCCVisibility : getCCVisibility,
		getCCStyle : getCCStyle,
		selectCaptionsTrack : selectCaptionsTrack,
		checkClosedCaptions : checkClosedCaptions
	}
};

/*  NOTE: This is only required when Video Controls are added */
ReferencePlayer.SettingsManager.ClosedCaptionsSettings = function (mediaPlayer) {
    "use strict";

    var player = mediaPlayer.getPlayer(),
        captionsSettings = null,
        defaultTextFormat = null,
        currentPanel = 0,
        panels = [
            "font-color",
            "background-color",
            "font-opacity",
            "background-opacity",
            "font-size",
            "font-style",
            // following not currently implemented in TVSDK
//                        "font-edge",
//                        "font-edge-color",
//                        "fill-color",
//                        "fill-opacity"
        ],

        populateSelector = function (name, type, value) {
            //var selector = document.getElementById(name);
            var selector = captionsSettings.querySelector("#" + name);
            // This errors our in IE
            // selector.options = [];
            for (var thing in type) {
                var name2 = thing.split("_").slice(1).join(" ").toLowerCase();
                selector.options.add(new Option(name2, type[thing]));
            }
            selector.selectedIndex = value;
        },

        populateRange = function (name, value) {
            //var selector = document.getElementById(name);
            var selector = captionsSettings.querySelector("#" + name);
            selector.value = parseInt(value);
        },

        settingsNav = function (event, direction)
        {
            // hide current panel
            document.getElementById(panels[currentPanel]).setAttribute("hidden", "true");

            // calculate next panel
            if (direction == "right")
            {
                currentPanel = (currentPanel + 1) % panels.length;
            }
            else
            {
                currentPanel = (currentPanel == 0) ? panels.length-1 : currentPanel-1;
            }

            document.getElementById(panels[currentPanel]).removeAttribute("hidden");
        },

		setCCFont = function (font)
		{
			var builder = new ReferencePlayer.TextFormatBuilder(getPlayer().ccStyle);
			builder.font = font;
			getPlayer().ccStyle = builder.build();
		},

		setCCFontSize = function (size)
		{
			var builder = new ReferencePlayer.TextFormatBuilder(getPlayer().ccStyle);
			builder.size = size;
			getPlayer().ccStyle = builder.build();
		},

		setCCFontColor = function(color)
		{
			var builder = new ReferencePlayer.TextFormatBuilder(getPlayer().ccStyle);
			builder.fontColor = color;
			getPlayer().ccStyle = builder.build();
		},

		setCCFontEdge = function(edge)
		{
			var builder = new ReferencePlayer.TextFormatBuilder(getPlayer().ccStyle);
			builder.fontEdge = edge;
			getPlayer().ccStyle = builder.build();
		},

		setCCFontEdgeColor = function(color)
		{
			var builder = new ReferencePlayer.TextFormatBuilder(getPlayer().ccStyle);
			builder.edgeColor = color;
			getPlayer().ccStyle = builder.build();
		},

		setCCFontOpacity = function(opacity)
		{
			var builder = new ReferencePlayer.TextFormatBuilder(getPlayer().ccStyle);
			builder.fontOpacity= opacity;
			getPlayer().ccStyle = builder.build();
		},

		setCCBackgroundColor = function(color)
		{
			var builder = new ReferencePlayer.TextFormatBuilder(getPlayer().ccStyle);
			builder.backgroundColor = color;
			getPlayer().ccStyle = builder.build();
		},

		setCCBackgroundOpacity = function(opacity)
		{
			var builder = new ReferencePlayer.TextFormatBuilder(getPlayer().ccStyle);
			builder.backgroundOpacity= opacity;
			getPlayer().ccStyle = builder.build();
		},

		setCCFillColor = function(color)
		{
			var builder = new ReferencePlayer.TextFormatBuilder(getPlayer().ccStyle);
			builder.fillColor = color;
			getPlayer().ccStyle = builder.build();
		},

		setCCFillOpacity = function(opacity)
		{
			var builder = new ReferencePlayer.TextFormatBuilder(getPlayer().ccStyle);
			builder.fillOpacity= opacity;
			getPlayer().ccStyle = builder.build();
		},

        onChange = function (event)
        {
            var id = event.target.id;
            var index = event.target.selectedIndex; // options selector
            var value = event.target.value; // range (opacity) selector

            switch(id)
            {
                case "font-style-selector":
                    setCCFont(index);
                    break;
                case "font-size-selector":
                    setCCFontSize(index);
                    break;
                case "font-color-selector":
                    setCCFontColor(index);
                    break;
                case "font-opacity-selector":
                    setCCFontOpacity(value);
                    break;
                case "background-color-selector":
                    setCCBackgroundColor(index);
                    break;
                case "background-opacity-selector":
                    setCCBackgroundOpacity(value);
                    break;
                case "font-edge-selector":
                    setCCFontEdge(index);
                    break;
                case "font-edge-color-selector":
                    etCCFontEdgeColor(index);
                    break;
                case "fill-color-selector":
                    setCCFillColor(index);
                    break;
                case "fill-opacity-selector":
                    setCCFillOpacity(value);
                    break;
            }
        },

        generateCCSettingsPanels = function (container) {
            var panel,
                lbl,
                range,
                output,
                selector;

            for (var i = 0; i < panels.length; i++) {

                panel = document.createElement("DIV");
                panel.id = panels[i];
                panel.classList.add("settings-panel");
                panel.setAttribute("hidden", "true");

                lbl = document.createElement("LABEL");
                lbl.for = panels[i] + "-selector";
                lbl.innerHTML = panels[i].split('-').map(function (s) {
                    return s.charAt(0).toUpperCase() + s.slice(1);
                }).join(' ');

                // if setting for opacity, create input range, otherwise create select option
                if (~panels[i].indexOf("opacity"))
                {
                    selector = document.createElement("DIV");
                    // center opacity slider vertically as they have low height
                    panel.classList.add("vertical-align");

                    range = document.createElement("INPUT");
                    range.type = "range";
                    range.min = 0;
                    range.max = 100;
                    range.step = 1;
                    range.id = panels[i] + "-selector";

                    output = document.createElement("OUTPUT");
                    output.name = panels[i] + "-output";
                    output.id = panels[i] + "-output";

                    range.addEventListener("change", (function (output) {
                        return function (event) {
                            // force 2 digits to prevent element width change
                            output.value = parseInt(this.value);
                            onChange(event);
                        };
                    }(output)));

                    selector.appendChild(range);
                    selector.appendChild(output);
                }
                else {
                    selector = document.createElement("SELECT");
                    selector.name = panels[i] + "-selector";
                    selector.id = panels[i] + "-selector";
                    selector.size = 6;

                    selector.addEventListener("change", onChange);
                }

                panel.appendChild(lbl);
                panel.appendChild(selector);

                container.appendChild(panel);
            }
        },

        init = function () {
        if (captionsSettings === null) {
            defaultTextFormat = player.ccStyle;

            captionsSettings = document.createElement("DIV");
            captionsSettings.id = "caption-style-panel";
            captionsSettings.classList.add("nav-panel");
            captionsSettings.setAttribute("hidden", "true");

            var settingsContainer = document.createElement("DIV");
            settingsContainer.id = "caption-style-container";
            settingsContainer.classList.add("nav-container");
            settingsContainer.setAttribute("hidden", "true");

            var navLeft = document.createElement("DIV");
            navLeft.id = "settings-nav-left";
            navLeft.classList.add("nav-bar");
            navLeft.classList.add("left");
            navLeft.setAttribute("hidden", "true");
            navLeft.addEventListener("click", function (e) {
                settingsNav(e, "left");
            });

            var navRight = document.createElement("DIV");
            navRight.id = "settings-nav-right";
            navRight.classList.add("nav-bar");
            navRight.classList.add("right");
            navRight.setAttribute("hidden", "true");
            navRight.addEventListener("click", function (e) {
                settingsNav(e, "right");
            });

            captionsSettings.appendChild(settingsContainer);
            captionsSettings.appendChild(navLeft);
            captionsSettings.appendChild(navRight);

            //parentContainer.appendChild(captionsSettings);

            generateCCSettingsPanels(settingsContainer);
            populateSelector("font-style-selector", ReferencePlayer.TextFormat.Font(), defaultTextFormat.font);
            populateSelector("font-size-selector", ReferencePlayer.TextFormat.Size(), defaultTextFormat.size);
            populateSelector("font-color-selector", ReferencePlayer.TextFormat.Color(), defaultTextFormat.fontColor);
            populateRange("font-opacity-selector", defaultTextFormat.fontOpacity);
            populateRange("font-opacity-output", defaultTextFormat.fontOpacity);

            populateSelector("background-color-selector", ReferencePlayer.TextFormat.Color(), defaultTextFormat.backgroundColor);
            populateRange("background-opacity-selector", defaultTextFormat.backgroundOpacity);
            populateRange("background-opacity-output", defaultTextFormat.backgroundOpacity);

            /* not currently implemented in PSDK
             populateSelector("font-edge-selector", AdobePSDK.TextFormat.FontEdge, defaultTextFormat.fontEdge);
             populateSelector("font-edge-color-selector", AdobePSDK.TextFormat.Color, defaultTextFormat.edgeColor);

             populateSelector("fill-color-selector", AdobePSDK.TextFormat.Color, defaultTextFormat.fillColor);
             populateRange("fill-opacity-selector", defaultTextFormat.fillOpacity);
             populateRange("fill-opacity-output", defaultTextFormat.fillOpacity);
             */
        }
    };

    // initialize captions settings
    init();

    return {

        /**
         * Get the generated HTML DOM object for these closed captions settings.
         * Attach this object to a parent element.
         * @returns {*} top-level DOM element node containing markup for closed captions settings.
         */
        getDOM : function () {
            return captionsSettings;
        },

        /**
         * Hide closed captions settings.
         */
        hide : function () {
            document.getElementById(panels[currentPanel]).setAttribute("hidden", "true");
            captionsSettings.setAttribute("hidden", "true");

            for (var i = 0; i < captionsSettings.children.length; i++)
            {
                captionsSettings.children[i].setAttribute("hidden", "true");
            }

        },

        /**
         * Display closed captions settings.
         */
        display : function () {
            document.getElementById(panels[currentPanel]).removeAttribute("hidden");
            captionsSettings.removeAttribute("hidden");

            for (var i = 0; i < captionsSettings.children.length; i++)
            {
                captionsSettings.children[i].removeAttribute("hidden");
            }
        }
    };

};
