ReferencePlayer.AddOns = ReferencePlayer.AddOns || {};
ReferencePlayer.AddOns.DRM = function() {
	var drmLicense = null,
    useLicenseCallback = false,
    drmUsername = "",
    drmPassword = "",

	getPlayer = function () {
		return playerWrapper.getPlayer();
	},

	fpsWithLicenseCallback = {
	        "com.apple.fps.1_0": {
                "licenseResponseType": "text",
                "httpRequestHeaders": {
                    "Content-type": "application/x-www-form-urlencoded"
                }
	        }
        },

    adobeFPSData = {
	           "com.apple.fps.1_0": {
	                "serverURL": "http://fairplay-fps.corp.adobe.com:8080/cgi-bin/fps.cgi?",
	                "licenseResponseType": "arraybuffer",
	                "httpRequestHeaders": {
	                    "Content-type": "application/octet-stream"
	                }
	            }
	},

	enableDRMEvents = function () {
        var protectionData = {
            "com.adobe.primetime": {
                "serverURL": {
                    "individualization-request": "http://individualization.adobe.com/flashaccess/i15n/v5",
                    "license-request": "http://chives.corp.adobe.com:8096/flashaccess/req",
                    "license-release": "http://chives.corp.adobe.com:8096/flashaccess/req"
                },
                "httpRequestHeaders": {
                }
            },
            "com.widevine.alpha": {
                "serverURL": "https://wv.service.expressplay.com/hms/wv/rights/?ExpressPlayToken=AQAAABIDKA4AAABQuPPoebWWZZD2l3APRKkkagEDOXmCjgbhsqJTYeZ9KabkjCvSLvuXGHiVLymBnouGXDdCKpbz5IvB3jCZp9U05pysl9eavucsWXnA0tafbM-1SSJKXOa70kvxAJ_ybhdcmy7-6g"
        },
        "com.microsoft.playready": {
                "serverURL": "https://expressplay-licensing.axprod.net/LicensingService.ashx?ExpressPlayToken=AQAAAw_ZXqcAAABgHD1gnn_AMQJKfFCP3k9zbBw2srzBLryJVLXclnjhcSBCz4TBzrtfegmSw1hAKdFHTNL-KVBGsI4ygBnfPRBUCvGsVOwpQ944fhq45W06ygJroB2xOrM03tbkWcrthI7y_UQdHzufHjcBqKZm8QDoqKpxrxc"
        },
/*
        "com.apple.fps.1_0": fpsWithLicenseCallback["com.apple.fps.1_0"],
*/
           //For Adobe
        "com.apple.fps.1_0": adobeFPSData["com.apple.fps.1_0"],

            "org.w3.clearkey": {
                "clearkeys": {
                    "H3JbV93QV3mPNBKQON2UtQ" : "ClKhDPHMtCouEx1vLGsJsA",
                    "IAAAACAAIAAgACAAAAAAAg" : "5t1CjnbMFURBou087OSj2w"
                }
            }
        };

        var drmManager = getPlayer().drmManager;
        if (drmManager) {
            drmManager.setProtectionData(protectionData);

            var listener = new AdobePSDK.DRMOperationCompleteListener(function() {
                console.log("DRM: Initialization complete!");
            }, function(major, minor, errorString) {
                console.log("DRM: Initialization Error: " + errorString);
            });
            //drmManager.initialize(listener);

            //drmManager.setEMESessionType("persistent");
        }
		getPlayer().addEventListener(AdobePSDK.MediaPlayer.Events.DRMMetadataInfoAvailableEvent, onDRMMetadataInfoAvailable);
	},

    base64EncodeUint8Array = function(input) {
        var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
        var output = "";
        var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
        var i = 0;

        while (i < input.length) {
            chr1 = input[i++];
            chr2 = i < input.length ? input[i++] : Number.NaN; // Not sure if the index
            chr3 = i < input.length ? input[i++] : Number.NaN; // checks are needed here

            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;

            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }
            output += keyStr.charAt(enc1) + keyStr.charAt(enc2) +
            keyStr.charAt(enc3) + keyStr.charAt(enc4);
        }
        return output;
    },

	onLicenseMessageCallback = function(drmLicenseRequest) {
        var licenseMessage = drmLicenseRequest.licenseMessage,
            assetId = drmLicenseRequest.assetId,
            base64Message = base64EncodeUint8Array(licenseMessage),
            messageStruct = {"assetId" : assetId,
                             "spc" : base64Message};

        var messageRequest = JSON.stringify(messageStruct);
        return messageRequest;
    },

    onDRMOperationCompleteFunc = function () {
        console.log("---------DRM SET AUTHENTICATION TOKEN-------- success ");
    },

	onLicenseReturnFunc = function () {
        console.log("DRM: License Return Complete ");
    },

    onLicenseReturnErrorFunc = function (major, minor, errorString/*, errorServerUrl*/) {
        console.log("DRM: License Return Error: " + errorString);
    },

	returnLicense = function() {
	    if (drmLicense) {
	        var drmManager = getPlayer().drmManager;
	        if (drmManager) {
	            var returnLicenseListener = new AdobePSDK.DRMReturnLicenseListener(onLicenseReturnFunc, onLicenseReturnErrorFunc);

	            drmManager.returnLicense(null, null, null, false, returnLicenseListener, drmLicense.session);
	        }
	    }
	},

    onAuthenticationCompleteFunc = function (authenticationToken) {
        var token = authenticationToken;
        var currentItem = getPlayer().currentItem;
        var arrDRMMetadataInfosObj = currentItem.drmMetadataInfos;
        var drmMetadata = null;
        var arrDRMPolicy = null;
        var licenseDomain = null;
        var drmManager = null;

        if(arrDRMMetadataInfosObj && arrDRMMetadataInfosObj.length > 0) {
            var drmMetadataInfos = arrDRMMetadataInfosObj[0];

            if(drmMetadataInfos) {
                drmMetadata = drmMetadataInfos.drmMetadata;
            }

            if (drmMetadata) {
                arrDRMPolicy = drmMetadata.policies;
                if(arrDRMPolicy && arrDRMPolicy.length > 0) {
                    var drmPolicy = arrDRMPolicy[0];
                    if(drmPolicy) {
                        licenseDomain =  drmPolicy.licenseDomain;
                        drmManager = getPlayer().drmManager;

                        var setAuthenticationTokenOperationCompleteListener = new AdobePSDK.DRMOperationCompleteListener(onDRMOperationCompleteFunc, onAcquireLicenseErrorFunc);
                        drmManager.setAuthenticationToken(drmMetadata, drmPolicy.authenticationDomain, token, setAuthenticationTokenOperationCompleteListener);
                    }
                }

            }

        }

        console.log("DRM: License Acquired : " + DRMLicense.session + " " + DRMLicense.message);
    },

	onAcquireLicenseFunc = function (DRMLicense) {
	    drmLicense = DRMLicense;
		console.log("--------DRM License Acquired------- Success");
	},

	onAcquireLicenseErrorFunc = function (major, minor, errorString/*, errorServerUrl*/) {
		console.log("DRM: License Acquire Error: " + errorString);
	},

	onDRMMetadataInfoAvailable = function(event)
	{
		console.log(event.type);

		var drmMetadataInfo = event.drmMetadataInfo;
        var drmMetadata = null;
        var arrDRMPolicy = null;
        var drmLicenseDomain = null;

        if(drmMetadataInfo) {
            drmMetadata = drmMetadataInfo.drmMetadata;
       }

		if (drmMetadata) {
            arrDRMPolicy = drmMetadata.policies;
            drmLicenseDomain = drmMetadata.licenseId;
			console.log("#DRMMetadataInfo  serverUrl:" + drmMetadata.serverUrl + " Policies:" + drmMetadata.policies + " LicenseId:" + drmMetadata.licenseId);
		}

		var drmManager = getPlayer().drmManager;
        var authenticateListener = new AdobePSDK.DRMAuthenticateListener(onAuthenticationCompleteFunc, onAcquireLicenseErrorFunc);
		var acquireLicenseListener = new AdobePSDK.DRMAcquireLicenseListener(onAcquireLicenseFunc, onAcquireLicenseErrorFunc);

        if(arrDRMPolicy && arrDRMPolicy.length > 0) {
            var drmPolicy = arrDRMPolicy[0];
            if(drmPolicy.authenticationMethod == AdobePSDK.DRMAuthenticationMethod.USERNAME_AND_PASSWORD) {
                setDRMAuthenticate();
                drmManager.authenticate(drmMetadata, drmMetadata.serverUrl, drmPolicy.authenticationDomain, drmUsername, drmPassword, authenticateListener);
            }
            /*else {
                if(drmLicenseDomain.authenticationMethod == AdobePSDK.DRMAuthenticationMethod.USERNAME_AND_PASSWORD) {
                    setDRMAuthenticate();
                    drmManager.authenticate(drmMetadata, drmLicenseDomain.serverUrl, drmLicenseDomain.authenticationDomain, "testuser", "testpass", authenticateListener);
                }
            }*/
        }

		if (drmManager) {
            if (useLicenseCallback) {
                drmManager.acquireLicense(drmMetadata, null, acquireLicenseListener, onLicenseMessageCallback);
            }
            else {
                drmManager.acquireLicense(drmMetadata, null, acquireLicenseListener);
            }
		}
	},

    setDRMSettings = function(DRMSettings) {
	    var protectionData = DRMSettings;
        if (protectionData) {
            var drmMgr = getPlayer().drmManager;
            if (drmMgr) {
                drmMgr.setProtectionData(protectionData);
            }
        }
    },

    setDRMAuthenticate = function() {
        var authenticateData = getDRMAuthenticate();
        drmUsername = authenticateData.userName;
        drmPassword = authenticateData.pwd;
    };

	return {
		enableDRMEvents: enableDRMEvents,
		returnLicense: returnLicense,
        setDRMSettings: setDRMSettings
	}
};
