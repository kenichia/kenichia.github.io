/*************************************************************************
*
* ADOBE CONFIDENTIAL
* ___________________
*
*  Copyright 2015 Adobe Systems Incorporated
*  All Rights Reserved.
*
* NOTICE:  All information contained herein is, and remains
* the property of Adobe Systems Incorporated and its suppliers,
* if any.  The intellectual and technical concepts contained
* herein are proprietary to Adobe Systems Incorporated and its
* suppliers and are protected by trade secret or copyright law.
* Dissemination of this information or reproduction of this material
* is strictly forbidden unless prior written permission is obtained
* from Adobe Systems Incorporated.
**************************************************************************/
var ExtCueOutContentFactory = function(audMetadata, fwMetadata, adPolicySelector ) {
    this.audMetadata = audMetadata;
	this.fwMetadata = fwMetadata;
	this.adPolicySelector = adPolicySelector;
    return this;
};


ExtCueOutContentFactory.prototype = {
      constructor: ExtCueOutContentFactory,

      retrieveResolversCallbackFunc : function(item) 
      {
		  if(this.fwMetadata)  //for freewheel setup; always use fw resolver for both live and vod
		  {
			  var result = [];
			  result.push(new FreeWheelResolver(this.fwMetadata, item.isLive));
			  return result;
		  }
      },

      retrieveOpportunityGeneratorsCallbackFunc : function(item) 
      {
    	  if(item.isLive)
    	  {
    		 //for live, we use custom opportunity generator
    		  //for both flash and MSE
    		  var result = [];
    		  result.push(new ExtCueOutOpportunityGenerator(this.audMetadata));
              return result;
    	  }
    	  else
    	  {
    		  //for vod; if freewheel, use freewheel opportunity generator
    		  //for both flash and MSE
    		  if(this.fwMetadata)
    		  {
    			  var result = [];
    			  result.push(new FreeWheelAdSignalingModeOpportunityGenerator());
    	          return result;
    		  }
    		  else
    		  {
    			  //for default Aud + Vod, only for flash
    			  //we need to give custom generator
    			  //for MSE default will work
    			  if(item.key)
    			  {
    				  var result = [];
        			  result.push(new ServerMapOpportunityGenerator(this.audMetadata));
        	          return result;
    			  }
    		  }
    	  }
      },

	  retrieveAdPolicySelectorCallbackFunc : function(item) 
	  {
	  	  if (this.adPolicySelector !== null &&
	  	  		this.adPolicySelector !== undefined) {
              console.log("let the custom AdPolicySelectors work");

              return this.adPolicySelector;
          }
		  console.log("let the default AdPolicySelectors work");
	  },

      retrieveCustomAdPlaybackHandlersCallbackFunc : function(item)
      {
          return null;
      },
};