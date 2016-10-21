var ExtCueOutOpportunityGenerator = function(metadata) {
    this.metadata = metadata;
	this.debug = 0;
	this.adId = 1;
    return this;
};

var compareTimedMetadata = function compare(a, b) { return a.time - b.time;};

ExtCueOutOpportunityGenerator.OPPORTUNITY_DURATION_KEY = "DURATION";
ExtCueOutOpportunityGenerator.OPPORTUNITY_ID_KEY = "BREAKID";
ExtCueOutOpportunityGenerator.OPP_TAG_NAME = "#EXT-X-CUE-OUT";
ExtCueOutOpportunityGenerator.MANIFEST_CUE_MODE = "manifest cues";

ExtCueOutOpportunityGenerator.prototype = {
    constructor : ExtCueOutOpportunityGenerator,
    _item : null,
    _client: null,
    _adSignalingMode : null,
    _advertisingMetadata : null,
    _playbackTime : -1,
    _processingTime : -1,
    _skippedTimedMetadatas : [],
    _processedTimedMetadatas : [],


    configureCallbackFunc : function (item, client, mode, playhead, playbackRange) {
    	this._item = item;
    	this._client = client;
    	this._adSignalingMode = mode;

        var itemConfig = this._item.config;
        if (!itemConfig) {
        	console.log("failed to get item config");
            return ;
        }

        this._advertisingMetadata = itemConfig.advertisingMetadata;
        /*if (!this._advertisingMetadata) {
            console.log("#configure Unable to retrieve the advertising metadata.");
            return;
        }*/

        this._processingTime = playhead;
        this._playbackTime = playhead;

        //generate one pre-roll for live
        var placement =  new AdobePSDK.Placement(AdobePSDK.PlacementType.PRE_ROLL,
				playhead,
				AdobePSDK.Placement.UNKNOWN_DURATION,
				AdobePSDK.PlacementMode.DEFAULT);

		var opportunity =  new AdobePSDK.Opportunity("initial_opportunity", placement, this.metadata, null);
		client.resolve(opportunity);

		//now process mid-rolls
        var timedMetadataList = this._item.timedMetadata;
        this.processMetadata(timedMetadataList, playbackRange);
    },

    /**
     * Processes the specified metadata collection by iterating through it and
     * invoking process method on each metadata.
     *
     * We need to take care of two things:
     * - already processed timed metadata. They should not be processed again as it will
     *   lead to timeline conflicts
     * - skippable timed metadata. They should not be process immediately as they are placed
     *   in the past and processing them might increas the resolving time
     *
     * @param timedMetadata Collection of metadata to be processed.
     * @return kECSuccess if the operation was successful.
     */
    processMetadata : function(timedMetadataList, playbackRange) {
        // console.log("#processMetadata processing timedMetadatas.");
        if(this.debugOpp())
        {
        	var placementType = AdobePSDK.PlacementType.MID_ROLL ;//"mid-roll";
            var placementMode = AdobePSDK.PlacementMode.DEFAULT; //"default";
            var placementTime = this._playbackTime + 240000;
            //var placementTime = playbackRange.end - 5000;
            var placementDuration = 12000;
            //var placementDuration = 900000;

            var placement = new AdobePSDK.Placement(placementType, placementTime, placementDuration, placementMode);
        	var opportunity =  new AdobePSDK.Opportunity("101", placement, null, null);
            this._client.resolve(opportunity);
        	return;
        }
        if(!timedMetadataList)
        	return;

    	for(var i = 0; i < timedMetadataList.length; i++)
    	{
            var timedMetadata = timedMetadataList[i];
            if (!this.isAlreadyProcessed(timedMetadata))
            {
                if (this.isSkippable(timedMetadata))
                {
//                    console.log("processMetadata Timed metadata skipped. ");
                    this._skippedTimedMetadatas.push(timedMetadata);
                }
                else
                {
                    // console.log("processMetadata Timed metadata processed.");
                    this._processedTimedMetadatas.push(timedMetadata);
                    if (this._processingTime < timedMetadata.time) {
                        this._processingTime = timedMetadata.time;
                    }

                    if (this.isPlacementOpportunity(timedMetadata))
                    {
                        var opportunity = this.createPlacementOpportunity(timedMetadata, this.metadata);
                        if (opportunity) {
                        	// console.log("#process Placement opportunity created.");
                        	this._client.resolve(opportunity);
                        }
                    }
                }
            }
        }

        this._skippedTimedMetadatas.sort(compareTimedMetadata);
        this._processedTimedMetadatas.sort(compareTimedMetadata);

        // console.log("#processMetadata Currently processed metadata : " + this._processedTimedMetadatas.length);
        // console.log("#processMetadata Currently skipped metadata : ", this._skippedTimedMetadatas.length);
    },

    /**
     * Checks if the specified timed metadata was already processed.
     * An timed metadata instance is considered to be processed if we tried to
     * create an opportunity from it, and not if we actually created an opportunity.
     *
     * @param timedMetadata Timed metadata to be checked.
     * @return true if the timed metadata was already processed and false otherwise.
     */
    isAlreadyProcessed : function(timedMetadata) {
        var len = this._processedTimedMetadatas.length;
        for (var i = 0; i < len; i++) {
            var tmp = this._processedTimedMetadatas[i];
            if (tmp.time == timedMetadata.time) {
                return true;
            }
        }

        return false;
    },

    isSkippable : function(timedMetadata) {
        return (timedMetadata.time < this._processingTime);
    },

   isPlacementOpportunity: function(timedMetadata) {
	    var validTag = timedMetadata.type == AdobePSDK.TimedMetadataType.TAG ||
	    	timedMetadata.type == "TAG";
	    if(!validTag)
	    	return false;
    	var tagName = timedMetadata.name;
        return tagName == ExtCueOutOpportunityGenerator.OPP_TAG_NAME || tagName == "#EXT-X-CUE";
    },

    breakUpContent : function(content)
    {
    	if(content.indexOf("#EXT") === 0)
    	{
    		var tagPivot = content.indexOf(':');
    		if(tagPivot != -1)
    		{
    			content = content.substring(tagPivot+1).trim();
    		}
    	}
    	var arr = content.split(",");
    	var tagMetadata = {};
    	for(var i = 0; i < arr.length; i++)
    	{
    		var set = arr[i];
    		var valMap = set.split("=");
    		if(valMap.length >= 2)
    		{
    			var prop1 = valMap[1].replace(/['"]+/g, '');
    			tagMetadata[valMap[0].toUpperCase()] = prop1;
    		}
    		else if (valMap.length == 1 && !isNaN(parseFloat(valMap[0])))
    		{
    			tagMetadata[ExtCueOutOpportunityGenerator.OPPORTUNITY_DURATION_KEY] = valMap[0];
    		}
    	}
    	return tagMetadata;
    },

    createPlacementOpportunity: function(timedMetadata, advertisingMetadata) {
        var placementType = AdobePSDK.PlacementType.MID_ROLL;//"mid-roll";
        var placementMode = AdobePSDK.PlacementMode.DEFAULT//"default";
        var placementTime = timedMetadata.time;
        var placementDuration = 0;

        var content = timedMetadata.content;
        if(!content)
        	return;

        //we parse metadata again because flash sdk does not parse metadata properly for non-adobe cues
        var tagMetadata = this.breakUpContent(content);
        var id = null;

        if(timedMetadata.name == "#EXT-X-CUE")
        {
        	if(tagMetadata["ELAPSED"])
        		return;
        	var durationProp = tagMetadata["DURATION"];
            placementDuration = durationProp * 1000;
            id = tagMetadata["ID"];
        }
        else if (timedMetadata.name == ExtCueOutOpportunityGenerator.OPP_TAG_NAME)
        {
        	if (tagMetadata[ExtCueOutOpportunityGenerator.OPPORTUNITY_DURATION_KEY])
            {
                var durationProp = tagMetadata[ExtCueOutOpportunityGenerator.OPPORTUNITY_DURATION_KEY];
                placementDuration = durationProp * 1000;
            }

            if(!placementDuration)
            {
            	placementDuration = 150000;
            }
            if (tagMetadata[ExtCueOutOpportunityGenerator.OPPORTUNITY_ID_KEY]) {
                id = tagMetadata[ExtCueOutOpportunityGenerator.OPPORTUNITY_ID_KEY];
            }
        }
        if(!id)
        	id = this.adId++;

        if(!placementDuration || isNaN(placementDuration))
        {
        	console.log("could not find duration in ad tag content. not able to generate placement opportunity");
        	return;
        }

    	var placement = new AdobePSDK.Placement(placementType, placementTime, placementDuration, placementMode);

        var opportunity =  new AdobePSDK.Opportunity(id, placement, advertisingMetadata, null);
        return opportunity;
    },

    debugOpp : function()
    {
    	/*if(this.debug%5 == 0)
    		return true;*/
    	return false;
    },

    updateCallbackFunc : function(playhead, playbackRange) {

      this.debug++;
      // console.log("#update Playback range : " + playbackRange.begin + playbackRange.end);

      this.removeObsoleteMetadata(this._skippedTimedMetadatas, playbackRange);
      this.removeObsoleteMetadata(this._processedTimedMetadatas, playbackRange);

      var availableMetadata  = [];
      if (playhead < this._playbackTime)
      {
    	  availableMetadata.push.apply(availableMetadata, this._skippedTimedMetadatas);
    	  this._skippedTimedMetadatas = [];
  		  this._processingTime = playhead;
      }

      var newTimedMetadata = this.retrieveNewTimedMetadata(this._item);
      if (newTimedMetadata.length)
      {
    	  availableMetadata.push.apply(availableMetadata, newTimedMetadata);
      }

      if (availableMetadata.length || this.debugOpp())
      {
          availableMetadata.sort(compareTimedMetadata);
          // console.log("#processMetadata Timed metadata to be processed : ", availableMetadata.length);
          this._playbackTime = playhead;
          return this.processMetadata(availableMetadata, playbackRange);
      }

    //  console.log("#processMetadata No additional timed metadata to be processed.");
    },

    retrieveNewTimedMetadata : function(item)
    {
    	var newTimedMetadata  = [];
    	var timedMetadataList = item.timedMetadata;
    	if(timedMetadataList)
    	{
    		var length = timedMetadataList.length;
        	if (length)
        	{
        		for (var i = length - 1; i >= 0; i--)
        		{
        			var timedMetadata = timedMetadataList[i];
        			if (timedMetadata.time >= this._processingTime && !this.isAlreadyProcessed(timedMetadata))
        			{
        				newTimedMetadata.push(timedMetadata);
        			}
        			else
        			{
        				break;
        			}
        		}
        	}
    	}
        return newTimedMetadata;
    },

    removeObsoleteMetadata : function(timedMetadataList, range)
    {
    	for (var i = 0; i < timedMetadataList.length;)
    	{
            var time = timedMetadataList[i].time;
            if (time >= range.begin) {
                return;
            }
            timedMetadataList.shift();
        }
    },

    cleanupCallbackFunc : function() {
    }
};
