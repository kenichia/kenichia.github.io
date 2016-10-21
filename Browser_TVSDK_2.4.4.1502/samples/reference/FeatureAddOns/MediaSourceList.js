// This Add-On handles the media source list picked up from sources.js
// This need to be supplied the Ids of button, source list and text box where selected source is to be saved

ReferencePlayer.AddOns = ReferencePlayer.AddOns || {};
ReferencePlayer.AddOns.MediaSourceList = function() {

	var mediaSourceListId,

	addOnSourceList = function (sourcesObj, mediaSourceButtonIdParam, mediaSourceListIdParam, mediaSourceTextBoxParam, mediaAdSourceParam, mediaForceFlashParam) {
	   // show the Media button
	   var mediaButton = document.getElementById(mediaSourceButtonIdParam);
	   // display list of source media when 'sources' button is clicked
	   mediaButton.onclick = toggleSourceMenuDisplay;
	   if (mediaButton.hasAttribute("hidden"))
	   {
		   mediaButton.removeAttribute("hidden");
	   }

	   mediaSourceListId = mediaSourceListIdParam;

	   var sources = sourcesObj;
	   var menu = document.createElement("DIV");
	   menu.id = "menu-overlay";
	   var datalist = document.createElement("UL");
	   menu.appendChild(datalist);

	   var protocol = '';
	   if (window.location.protocol != "https:")
		   protocol = "http://";
	   else
		   protocol = "https://";

       var textInput = document.getElementById(mediaSourceTextBoxParam);
	   var adtextInput = document.getElementById(mediaAdSourceParam);
	   var forceFlashInput = document.getElementById(mediaForceFlashParam);
	   var item;
	   for (var i = 0; i < sources.entries.length; i++)
	   {
		   item = document.createElement("LI");
		   item.innerHTML = sources.entries[i].title;
		   sources.entries[i].content[0].url = sources.entries[i].content[0].url.replace('http://', protocol);
		   item.addEventListener("click", (function (url, target, metadata, adurltarget, forceflash, forceflashtarget) {
			   return function (event)
			   {
				   target.value = url;

				   adurltarget.value = "{}";
				   if(metadata != undefined)
				   {
					   adurltarget.value = JSON.stringify(metadata.ad);
				   }

				   forceflashtarget.value = forceflash;
			   }
		   })(sources.entries[i].content[0].url, textInput, sources.entries[i].metadata , adtextInput, sources.entries[i].forceflash, forceFlashInput));
		   datalist.appendChild(item);
	   }

	   // as list of source media is an overlay, hide list when overlay is clicked.
	   var menuOverlay = document.getElementById(mediaSourceListId);
	   menuOverlay.appendChild(menu);
	   menuOverlay.onclick = toggleSourceMenuDisplay;
	},

	toggleSourceMenuDisplay = function (event) {
	   var menu = document.getElementById(mediaSourceListId);
	   if (menu.hasAttribute("hidden"))
	   {
		   menu.removeAttribute("hidden");
		   menu.setAttribute("style","display:block;"); // for force rendering, edge 20 specific bug, bug id : 9381 fix.
		   menu.removeAttribute("style");
	   }
	   else
	   {
		   menu.setAttribute("hidden", "true");
	   }
	}

	clearSourceList = function (mediaSourceListIdParam, menuOverlayIdParam) {
		var sourceList = document.getElementById(mediaSourceListIdParam);
		var menuOverlay = document.getElementById(menuOverlayIdParam);
		 if (menuOverlay != null) {
			 sourceList.removeChild(menuOverlay);
		 }
	}

	return {
		addOnSourceList	: addOnSourceList,
		clearSourceList : clearSourceList
	}
};