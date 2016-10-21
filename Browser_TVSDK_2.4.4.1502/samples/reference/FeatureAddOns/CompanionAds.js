ReferencePlayer.AddOns = ReferencePlayer.AddOns || {};
ReferencePlayer.AddOns.CompanionAds = {};


ReferencePlayer.AddOns.CompanionAds.enable = function (companionDivId) {
  /**
   * This function displays the companion ads for a given ad.
   */
  var displayCompanions = function (ad) {
    if (ad) {
      var companions = ad.companionAssets, companionDiv = document.getElementById(companionDivId);
      var divTag;
      if (!companions){
        return;
      }
      for (var i=0; i<companions.length; ++i) {
        var bannerId = "banner" + companions[i].width + "x" + companions[i].height;
        divTag = companionDiv.querySelector("#" + bannerId);

        if (!divTag) {
          divTag = document.createElement("div");
          divTag.style.width = companions[i].width + "px";
          divTag.style.height = companions[i].height + "px";
          divTag.setAttribute("id", bannerId);
          companionDiv.appendChild(divTag);
        }
        divTag.innerHTML = companions[i].bannerData;
      }
    }
  };

  // Register 'displayCompanions' for the AdStartedEvent.
  getPlayer().addEventListener(AdobePSDK.MediaPlayer.Events.AdStartedEvent, function (event) {
    displayCompanions(event.ad);
  });
};
