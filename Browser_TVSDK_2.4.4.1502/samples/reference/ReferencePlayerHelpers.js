/**
 * Helper objects
 * ReferencePlayer.TextFormat.Color
 * ReferencePlayer.TextFormat.Size
 * ReferencePlayer.TextFormat.Font
 * ReferencePlayer.TextFormat.FontEdge
 * ReferencePlayer.TextFormatBuilder
 * ReferencePlayer.SettingsManager
 * ReferencePlayer.SettingsManager.ClosedCaptionsSettings
 *
 */

ReferencePlayer.TextFormat = ReferencePlayer.TextFormat || {};
ReferencePlayer.TextFormat.Color = function ()
{
	return {
        COLOR_BLACK: AdobePSDK.TextFormat.BLACK,
        COLOR_GRAY: AdobePSDK.TextFormat.GRAY,
        COLOR_WHITE: AdobePSDK.TextFormat.WHITE,
        COLOR_BRIGHT_WHITE: AdobePSDK.TextFormat.BRIGHT_WHITE,
        COLOR_DARK_RED: AdobePSDK.TextFormat.DARK_RED,
        COLOR_RED: AdobePSDK.TextFormat.RED,
        COLOR_BRIGHT_RED: AdobePSDK.TextFormat.BRIGHT_RED,
        COLOR_DARK_GREEN: AdobePSDK.TextFormat.DARK_GREEN,
        COLOR_GREEN: AdobePSDK.TextFormat.GREEN,
        COLOR_BRIGHT_GREEN: AdobePSDK.TextFormat.BRIGHT_GREEN,
        COLOR_DARK_BLUE: AdobePSDK.TextFormat.DARK_BLUE,
        COLOR_BLUE: AdobePSDK.TextFormat.BLUE,
        COLOR_BRIGHT_BLUE: AdobePSDK.TextFormat.BRIGHT_BLUE,
        COLOR_DARK_YELLOW: AdobePSDK.TextFormat.DARK_YELLOW,
        COLOR_YELLOW: AdobePSDK.TextFormat.YELLOW,
        COLOR_BRIGHT_YELLOW: AdobePSDK.TextFormat.BRIGHT_YELLOW,
        COLOR_DARK_MAGENTA: AdobePSDK.TextFormat.DARK_MAGENTA,
        COLOR_MAGENTA: AdobePSDK.TextFormat.MAGENTA,
        COLOR_BRIGHT_MAGENTA: AdobePSDK.TextFormat.BRIGHT_MAGENTA,
        COLOR_DARK_CYAN: AdobePSDK.TextFormat.DARK_CYAN,
        COLOR_CYAN: AdobePSDK.TextFormat.CYAN,
        COLOR_BRIGHT_CYAN: AdobePSDK.TextFormat.BRIGHT_CYAN
};
};

ReferencePlayer.TextFormat.Size = function ()
{
	return {
        SIZE_DEFAULT: AdobePSDK.TextFormat.SIZE_DEFAULT,
        SIZE_SMALL: AdobePSDK.TextFormat.SMALL,
        SIZE_MEDIUM: AdobePSDK.TextFormat.MEDIUM,
        SIZE_LARGE: AdobePSDK.TextFormat.LARGE
	};
};

ReferencePlayer.TextFormat.Font = function ()
{
	return {
        FONT_DEFAULT: AdobePSDK.TextFormat.FONT_DEFAULT,
        FONT_MONOSPACED_WITH_SERIFS: AdobePSDK.TextFormat.MONOSPACED_WITH_SERIFS,
        FONT_PROPORTIONAL_WITH_SERIFS: AdobePSDK.TextFormat.PROPORTIONAL_WITH_SERIFS,
        FONT_MONOSPACED_WITHOUT_SERIFS: AdobePSDK.TextFormat.MONOSPACED_WITHOUT_SERIFS,
        FONT_CASUAL: AdobePSDK.TextFormat.CASUAL,
        FONT_CURSIVE: AdobePSDK.TextFormat.CURSIVE,
        FONT_SMALL_CAPITALS: AdobePSDK.TextFormat.SMALL_CAPITALS
	};
};

ReferencePlayer.TextFormat.FontEdge = function ()
{
	return {
        FONT_EDGE_DEFAULT: AdobePSDK.TextFormat.FONT_EDGE_DEFAULT,
        FONT_EDGE_NONE: AdobePSDK.TextFormat.NONE,
        FONT_EDGE_RAISED: AdobePSDK.TextFormat.RAISED,
        FONT_EDGE_DEPRESSED: AdobePSDK.TextFormat.DEPRESSED,
        FONT_EDGE_UNIFORM: AdobePSDK.TextFormat.UNIFORM,
        FONT_EDGE_DROP_SHADOW_LEFT: AdobePSDK.TextFormat.DROP_SHADOW_LEFT,
        FONT_EDGE_DROP_SHADOW_RIGHT: AdobePSDK.TextFormat.DROP_SHADOW_RIGHT
	};
};

ReferencePlayer.TextFormatBuilder = function (textFormat)
{
    "use strict";
    var _font = textFormat.font,
        _size = textFormat.size,
        _fontColor = textFormat.fontColor,
        _fontEdge = textFormat.fontEdge,
        _edgeColor = textFormat.edgeColor,
        _fontOpacity = textFormat.fontOpacity,
        _backgroundColor = textFormat.backgroundColor,
        _backgroundOpacity = textFormat.backgroundOpacity,
        _fillColor = textFormat.fillColor,
        _fillOpacity = textFormat.fillOpacity,
        _fontLength = Object.keys(ReferencePlayer.TextFormat.Font()).length,
        _colorLength = Object.keys(ReferencePlayer.TextFormat.Color()).length,
        _sizeLength = Object.keys(ReferencePlayer.TextFormat.Size()).length,
        _edgeLength = Object.keys(ReferencePlayer.TextFormat.FontEdge()).length;


    this.build = function ()
    {
        return new AdobePSDK.TextFormat(
            _font,
            _fontColor,
            _edgeColor,
            _fontEdge,
            _backgroundColor,
            _fillColor,
            _size,
            _fontOpacity,
            _backgroundOpacity,
            _fillOpacity
        );
    };

    Object.defineProperty(this, "font", {
        set : function (value) {
            if (typeof value !== 'undefined' &&
                value > -1 && value <= _fontLength)
            {
                _font = value;
            }
        },
        get : function () {
            return _font;
        }
    });


    Object.defineProperty(this, "size", {
        set : function (value) {
            if (typeof value !== 'undefined' &&
                value > -1 && value < _sizeLength)
            {
                _size = value;
            }
        },
        get : function () {
            return _size;
        }
    });


    Object.defineProperty(this, "fontColor", {
        set : function (value) {
            if (typeof value !== 'undefined' &&
                value > -1 && value < _colorLength)
            {
                _fontColor = value;
            }
        },
        get : function () {
            return _fontColor;
        }
    });

    Object.defineProperty(this, "fontEdge", {
        set : function (value) {
            if (typeof value !== 'undefined' &&
                value > -1 && value < _edgeLength)
            {
                _fontEdge = value;
            }
        },
        get : function () {
            return _fontEdge;
        }
    });


    Object.defineProperty(this, "edgeColor", {
        set : function (value) {
            if (typeof value !== 'undefined' &&
                value > -1 && value < _colorLength)
            {
                _edgeColor = value;
            }
        },
        get : function () {
            return _edgeColor;
        }
    });


    Object.defineProperty(this, "fontOpacity", {
        set : function (value) {
            if (typeof value !== 'undefined' &&
                value >= 0 && value <= 100)
            {
                _fontOpacity = value;
            }
        },
        get : function () {
            return _fontOpacity;
        }
    });

    Object.defineProperty(this, "backgroundColor", {
        set : function (value) {
            if (typeof value !== 'undefined' &&
                value > -1 && value < _colorLength)
            {
                _backgroundColor = value;
            }
        },
        get : function () {
            return _backgroundColor;
        }
    });

    Object.defineProperty(this, "backgroundOpacity", {
        set : function (value) {
            if (typeof value !== 'undefined' &&
                value >= 0 && value <= 100)
            {
                _backgroundOpacity = value;
            }
        },
        get : function () {
            return _backgroundOpacity;
        }
    });

    Object.defineProperty(this, "fillColor", {
        set : function (value) {
            if (typeof value !== 'undefined' &&
                value > -1 && value < _colorLength)
            {
                _fillColor = value;
            }
        },
        get : function () {
            return _fillColor;
        }
    });

    Object.defineProperty(this, "fillOpacity", {
        set : function (value) {
            if (typeof value !== 'undefined' &&
                value >= 0 && value <= 100)
            {
                _fillOpacity = value;
            }
        },
        get : function () {
            return _fillOpacity;
        }
    });

};

/**
 * Settings Manager used to register settings panels and control their display.
 * @param parentElmContainer - DOM element to attach settings manager display.
 */
ReferencePlayer.SettingsManager = function (parentElmContainer)
{
    var settings = {},
        parentContainer = parentElmContainer,
        container,
        mainPanel,

        init = function () {
            // create the main settings panel which will list all sub-settings
            mainPanel = document.createElement("DIV");
            mainPanel.id = "settings-panel-main";
            mainPanel.classList.add("settings-panel");
            mainPanel.setAttribute("hidden", "true");
            container.appendChild(mainPanel);

            // add the main settings panel so it can be hidden/displayed using settings manager
            var main = new ReferencePlayer.SettingsManager.Setting();
            main.id = mainPanel.id;
            main.name = "Settings";
            main.settingsDOM = mainPanel;

            settings[main.id] = main;

        },

        /**
         * Hide settings options. Call this from a "settings" button.
         */
        hideManager = function () {
            container.setAttribute("hidden", "true");
            hideAllSettings();
        },

        /**
         * Display settings options. Call this from a "settings" button.
         */
        displayManager = function () {
            container.removeAttribute("hidden");
            mainPanel.removeAttribute("hidden");
        },

        /**
         * Toggles display of the settings options.
         * @returns {{visible: boolean}} true if the settings are now displayed,
         * false if the settings are now hidden.
         */
        toggleDisplay = function () {
            if (container.hasAttribute("hidden"))
            {
                displayManager();
                return {visible: true};
            }
            else
            {
                hideManager();
                return {visible: false};
            }
        },

        /**
         * Register a new Setting object. Adds a new link to this setting panel from the main
         * settings page.
         * @param setting ReferencePlayer.SettingsManager.Setting object
         */
        registerSetting = function (setting)
        {
            if (settings[setting.id] === undefined) {
                settings[setting.id] = setting;
                container.appendChild(setting.settingsDOM);

                var button = document.createElement("BUTTON");
                button.type = "button";
                button.id = "btn_" + setting.id;
                button.classList.add("link");
                button.innerHTML = setting.name;
                button.addEventListener("click", function () {
                    hideAllSettings();
                    setting.display();
                });

                mainPanel.appendChild(button);

            }
        },

        /**
         * Hide all the settings panels.
         */
        hideAllSettings = function ()
        {
            var keys = Object.keys(settings);
            for (var i = 0; i < keys.length; i++)
            {
                settings[keys[i]].hide();
            }
        },

        /**
         * Display a specific settings panel.
         * @param id - settings panel identifier.
         */
        displaySettingsFor = function (id)
        {
            if (containsSetting(id))
            {
                hideAllSettings();
                settings[id].display();
            }
        },

        containsSetting = function (id)
        {
            return settings.hasOwnProperty(id);
        },

        reset = function ()
        {
            hideManager();

            // remove all elements from the DOM
            while (container.firstChild) {
                container.removeChild(container.firstChild);
            }

            // clear settings array
            settings = {};

            // re-initialize manager
            init();
        };

    // create settings manager container
    container = document.createElement("DIV");
    container.id = "settings-container";
    container.setAttribute("hidden", "true");
    parentContainer.appendChild(container);

    // initialize settings manager when constructed
    init();


    return  {
        /**
         * Register a new Setting object to the manager. Adds a button to the main
         * settings panel which when selected will display the settings set in settingsDOM.
         */
        register : registerSetting,

        /**
         * Reset this settings manager by removing all settings panels from the DOM.
         */
        reset : reset,

        /**
         * Hides all settings panels. Does not hide the settings manager container.
         */
        hideAll : hideAllSettings,

        /**
         * Hides the settings manager container DOM element and all settings panels.
         */
        hideManager : hideManager,

        /**
         * Displays the settings manager container DOM element and the main settings panel.
         */
        displayManager : displayManager,

        /**
         * Toggle the display of the settings manager container DOM element.
         * @returns {visible: boolean} true if the settings manager is now displayed,
         * false if the settings manager is now hidden.
         */
        toggleManagerDisplay : toggleDisplay,

        /**
         * Displays the specified settings panel.
         * @param id the Setting.id to display
         */
        displaySettingsFor : displaySettingsFor,

        /**
         * Check if a given settings is already registered with this manager.
         * @param id the Setting.id
         */
        containsSetting : containsSetting

    };
};

ReferencePlayer.SettingsManager.Setting = function() {
    "use strict";

    /**
     * ID used to reference this setting.
     */
    this.id = undefined;

    /**
     * Named used in the main settings panel which links to this setting.
     */
    this.name = undefined;

    /**
     * The top-level DOM element which displays the settings.
     */
    this.settingsDOM = undefined;

    /**
     * Function which hides the settingsDOM element.
     */
    this.hide = function () { this.settingsDOM.setAttribute("hidden", "true"); };

    /**
     * Function which displays the settingsDOM element.
     */
    this.display = function () { this.settingsDOM.removeAttribute("hidden"); };

    return this;

};

// Global helper functions
var getDate = function()
{
    var dd = new Date();
    var ts_str = dd.getFullYear()+"-"+dd.getMonth()+"-"+dd.getDate()+" "+dd.getHours()+":"+dd.getMinutes()+":"+dd.getSeconds()+"."+dd.getMilliseconds();
    return ts_str;
};

onEvent = function (name, event) {
    console.log("Player event: " + name);
    var letsLog = "";
    if (typeof event === 'object' && event.target === undefined) // printing 'this' causes JSON error
    {
        letsLog = "["+getDate()+"] [Events] Event: " + JSON.stringify(event);
    }
    else if (typeof event === 'object')
    {
        letsLog = "["+getDate()+"] [Events] Value: " +  event.type;
    }
    else
    {
        letsLog = "["+getDate()+"] [Events] Value: " + event;
    }
    letsLog += "\n";
    playerWrapper.dispatchEventWrapper(ReferencePlayer.Events.LogEvent, {message: letsLog});
};