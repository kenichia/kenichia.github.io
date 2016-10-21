// Console Logs
var consoleLogsVisible = false;
function isConsoleLogsAvail () {return consoleLogsVisible;}
function addOnConsoleLogs (consoleLogsDivId) {
    consoleLogsVisible = true;
    insertConsoleLogs(consoleLogsDivId);
    overrideConsole();
}

function overrideConsole() {
    (function(){
        try {
            var oldLog = console ? console.log : null;
            console.log = function (message) {
                setConsoleLog(message);
                if (oldLog !== null)
                    oldLog.apply(console, arguments);
            };
        } catch(e) {
            logger.println("console log is not supported on this platform");
        }
    })();
}

var consoleLog = "";

function setConsoleLog(value){
    if (isConsoleLogsAvail()){
        var filter = document.getElementById("consoleLogsFilter");
        if (filter.value != "") {
            if (value.indexOf(filter.value) > -1) {
                $('#console_logs').append('<p class="console-content">' + value + '</p>');
            }
        } 
        else {
            $('#console_logs').append('<p class="console-content">' + value + '</p>');
        }
        var consoleId = document.getElementById("console_logs");
        consoleId.scrollTop = consoleId.scrollHeight;
    }
}

function getConsoleLog(){
    return consoleLog;
}

function resetConsoleLogs () {
    if (isConsoleLogsAvail()) {
        var consoleId = document.getElementById('console_logs');
        while (consoleId.firstChild) {
            consoleId.removeChild(consoleId.firstChild);
        }
    }
}

function toggleConsoleLogsVisibility() {
    var isEnabled = document.getElementById("isConsole").checked;
    if (isEnabled) {
        resetConsoleLogs();
        consoleLogsVisible = true;
    }
    else {
        consoleLogsVisible = false;
    }
}

function insertConsoleLogs (consoleLogsDivId) {
    document.getElementById(consoleLogsDivId).removeAttribute("style");

    var consoleLogsHTML = '<b>Console Logs</b>'
                                + '<table style="width:100%">'
                                + '<tr height="30px">'
                                + '<td>'
                                + '<input type="checkbox" id="isConsole" checked="true"  class="checkbox" onclick="toggleConsoleLogsVisibility();"/> Enable Console Logs'
                              	+ '</td>'
                                + '<td>'
                                + 'Filter: <input type="text" id="consoleLogsFilter">'
                                + '</td>'
                                + '<td>'
                              	+ '<button style="width:100%;height:100%" onclick="resetConsoleLogs();">Clear</button>'
                              	+ '</td> '
                                + '</tr>'
                                + '</table>'
                                + '<div class="console" id="console_logs"></div>';

    var targetIdElement = this.window.document.getElementById(consoleLogsDivId);
    targetIdElement.innerHTML = consoleLogsHTML;
    playerWrapper.addEventListener(ReferencePlayer.Events.LoadInitiatedEvent, ReferencePlayer.AddOns.ConsoleLogs.onLoadInitEvent);
}

ReferencePlayer.AddOns = ReferencePlayer.AddOns || {}
ReferencePlayer.AddOns.ConsoleLogs = {}

ReferencePlayer.AddOns.ConsoleLogs.onLoadInitEvent = function (event) {
    resetConsoleLogs ();
}
