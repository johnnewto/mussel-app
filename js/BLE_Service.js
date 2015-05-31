var BLE_Service = function () {

		//this.initialize = function() {
			// BLE object.
			//var ble = {};
			// Device list.
		//	}
		var self = this;
		this.devices = {};
		this.lastdevice = {};
		
		this.initialize = function() {
        var deferred = $.Deferred();
        deferred.resolve(self.devices);
        return deferred.promise();
    }
		
/* 		this.getDevices = function () {
				var deferred = $.Deferred();	
				evothings.easyble.stopScan();
				console.log("Startscan");
				evothings.easyble.startScan(
					function(device) {
						// Report success. Sometimes an RSSI of +127 is reported.
						// We filter out these values here.
						if (device.rssi <= 0) {
							  device.timeStamp = Date.now();
								// Insert the device into table of found devices.
								this.devices[device.address] = device;
								this.lastdevice = device;
						}
						console.log(';;;' + self.devices.length);
						deferred.resolve(self.devices);
					},
					function(errorCode) {
						// Report error.
						console.log("device Not Found");
						deferred.reject("Transaction Error: " + errorCode.message);
					}
				);

				if(self.devices.length > 0) { 
				  console.log(';;;' + self.devices.length);
					deferred.resolve(self.devices);
		      //console.log('lastDevice ' + self.lastdevice.rssi); 
				  //deferred.resolve();
				}
			  return deferred.promise();
				
		}
 */		
		this.startScan = function(callbackFun) { 
				var self = this;
				console.log("Startscan");
				evothings.easyble.stopScan();
				evothings.easyble.startScan( 
					function(device) {
						// Report success. Sometimes an RSSI of +127 is reported.
						// We filter out these values here.
						if (device.rssi <= 0) {
							self.deviceFound(device, null);
						}
					},
					function(errorCode) {
						// Report error.
						this.deviceFound(null, errorCode);
					}
				);
		}
		
		// Stop scanning for devices.
		this.stopScan = function() { 
			console.log("stopscan");
			evothings.easyble.stopScan();
		}

			// Called when a device is found.
		this.deviceFound = function(device, errorCode) { 
		  //var self = this;
			if (device) {
				// Set timestamp for device (this is used to remove
				// inactive devices).
				device.timeStamp = Date.now();

				// Insert the device into table of found devices.
				this.devices[device.address] = device;
				this.lastdevice = device;
//				console.log(this.lastdevice.rssi + " " + this.lastdevice.scanRecord); 
//				console.log(JSON.stringify(this.devices));
			}
			else if (errorCode) {
				console.log("device Not Found");
				//app.ui.displayStatus('Scan Error: ' + errorCode);
			}
		}
		
		
		this.test = function () {

			console.log("test");
		}

		


}