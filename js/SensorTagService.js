var SensorTagService = function () {

		//this.initialize = function() {
			// BLE object.
			//var ble = {};
			// Device list.
		//	}
		
		var self = this;
		var sensortag = evothings.tisensortag.createInstance();

		this.devices = {};
		var lastdevice = {};
		
		// this.initialize = function() {
        // var deferred = $.Deferred();
        // deferred.resolve(self.devices);
        // return deferred.promise();
    // }
		
	
	this.initialiseSensorTag = function()
	{
		this.sensortag = sensortag;
		//
		// Here sensors are set up.
		//
		// If you wish to use only one or a few sensors, just set up
		// the ones you wish to use.
		//
		// First parameter to sensor function is the callback function.
		// Several of the sensors take a millisecond update interval
		// as the second parameter.
		// Gyroscope takes the axes to enable as the third parameter:
		// 1 to enable X axis only, 2 to enable Y axis only, 3 = X and Y,
		// 4 = Z only, 5 = X and Z, 6 = Y and Z, 7 = X, Y and Z.
		//
		sensortag
//			.statusCallback(statusHandler)
			.errorCallback(this.errorHandler)
			.keypressCallback(this.keypressHandler)
			.irTemperatureCallback(this.irTemperatureHandler, 500)
//			.humidityCallback(humidityHandler)
//			.barometerCallback(barometerHandler, 500)
			.accelerometerCallback(accelerometerHandler, 200)
//			.lockCallback(lockHandler, 200)
			.magnetometerCallback(magnetometerHandler, 200)
//			.gyroscopeCallback(gyroscopeHandler, 200, 7) // 7 = enable all axes.
//			.connectToClosestDevice()
//			.startScanCallback(this.deviceFound)
	}

	this.startScan = function() {
		var self = this;
		sensortag.startScan(
			function(device, errorCode) { 
				if (device) {
					// Set timestamp for device (this is used to remove inactive devices).
					device.timeStamp = Date.now();
					// Insert the device into table of found devices.
					self.devices[device.address] = device;
					lastdevice = device;
				}
				else if (errorCode) {
					console.log("device Not Found");
				}
			}
		)
	}
		
	// Stop scanning for devices.
	this.stopScan = function() { 
		console.log("stopscan");
		sensortag.stopScan();
	}

	// connect devices.
	this.connectToDevice = function(device, model) {
		// call back functions report to this model
		this.model = model;
		console.log("connect");
		evothings.easyble.stopScan()
		sensortag.device = device;
		sensortag.connectToDevice();
	}
	
	this.statusHandler = function(status)
	{
		if ('Device data available' == status)
		{
			displayValue('FirmwareData', sensortag.getFirmwareString())
		}
		displayValue('StatusData', status)
	}

	this.errorHandler = function(error)
	{
		console.log('Error: ' + error)
		if ('disconnected' == error)
		{
			// Clear current values.
			// var blank = '[Waiting for value]'
			// displayValue('StatusData', 'Ready to connect')
			// displayValue('FirmwareData', '?')
			// displayValue('KeypressData', blank)
			// displayValue('IRTemperatureData', blank)
			// displayValue('AccelerometerData', blank)
			// displayValue('HumidityData', blank)
			// displayValue('MagnetometerData', blank)
			// displayValue('BarometerData', blank)
			// displayValue('GyroscopeData', blank)

			// Reset screen color.
			setBackgroundColor('white')

		//	If disconneted attempt to connect again.
			// setTimeout(
				// function() { sensortag.connectToClosestDevice() },
				// 1000)
		}
	}

	// calculations implemented as based on TI wiki pages
	// http://processors.wiki.ti.com/index.php/SensorTag_User_Guide

	this.keypressHandler = function(data) {
		// Update background color.
		switch (data[0])
		{
			case 0:
				setBackgroundColor('white')
				break;
			case 1:
				setBackgroundColor('red')
				break;
			case 2:
				setBackgroundColor('blue')
				break;
			case 3:
				setBackgroundColor('magenta')
				break;
		}

		// Update the value displayed.
		var string = 'raw: 0x' + bufferToHexStr(data, 0, 1)
		displayValue('KeypressData', string)
	}
	
	this.irTemperatureHandler = function(data) {
		// Calculate temperature from raw sensor data.
		var values = sensortag.getIRTemperatureValues(data)
		var ac = values.ambientTemperature
		var af = sensortag.celsiusToFahrenheit(ac)
		var tc = values.targetTemperature
		var tf = sensortag.celsiusToFahrenheit(tc)

		// Prepare the information to display.
		// var string =
			// 'raw: 0x' + bufferToHexStr(data, 0, 4) + '<br/>'
			// + (tc >= 0 ? '+' : '') + tc.toFixed(2) + '&deg; C '
			// + '(' + (tf >= 0 ? '+' : '') + tf.toFixed(2) + '&deg; F)' + '<br/>'
			// + (ac >= 0 ? '+' : '') + ac.toFixed(2) + '&deg; C '
			// + '(' + (af >= 0 ? '+' : '') + af.toFixed(2) + '&deg; F) [amb]' + '<br/>'

		self.model.set({
			temp_Raw:  bufferToHexStr(data, 0, 4), 
			temp_Target: tc.toFixed(2),
			temp_Ambient: ac.toFixed(2)
		});
	}
	
		// Display the list of devices
	this.displayDeviceList = function (collection) {			
		var timeNow = Date.now();

		$.each(self.devices, function(key, device)
		{
			// Only add devices that are updated during the last 2 seconds.
			if (device.timeStamp + 2000 > timeNow)
			{

				var encodedData = {};
				var decodedData = [];
				
				encodedData = device.advertisementData.kCBAdvDataManufacturerData;

				if (encodedData !== undefined) {
				   decodedData = base64_decode(encodedData); // decode the string
				}
				
				// id must be unique  to fire an add to collection event
				var _device = new Device({id: device.address, address: device.address, name: device.name, 	
											rssi: device.rssi, scanRecord: device.scanRecord, 
											manuData: decodedData.map(String), timeStamp: device.timeStamp, 
											extra: "hi" });
				// merge into collection, this fires a model change event if same id or collection add is new
				collection.add(_device, {merge: true});
			}
		});
		
		//delete devices older than 2 seconds
		collection.each(function(device){
			if(device.attributes.timeStamp + 2000 < timeNow)
				collection.remove(device);
		});	
	}	

	//==============================================
	
	function accelerometerHandler(data) {
		// Calculate the x,y,z accelerometer values from raw data.
		var values = sensortag.getAccelerometerValues(data)
		self.model.set({
			accl_Raw:  bufferToHexStr(data, 0, 3), 
			accl_x: values.x.toFixed(5),
			accl_y: values.y.toFixed(5),
			accl_z: values.z.toFixed(5)
		});
	}

	function humidityHandler(data) {
		// Calculate the humidity values from raw data.
		var values = sensortag.getHumidityValues(data)

		// Calculate the humidity temperature (C and F).
		var tc = values.humidityTemperature
		var tf = sensortag.celsiusToFahrenheit(tc)

		// Calculate the relative humidity.
		var h = values.relativeHumidity

		// Prepare the information to display.
		// string =
			// 'raw: 0x' + bufferToHexStr(data, 0, 4) + '<br/>'
			// + (tc >= 0 ? '+' : '') + tc.toFixed(2) + '&deg; C '
			// + '(' + (tf >= 0 ? '+' : '') + tf.toFixed(2) + '&deg; F)' + '<br/>'
			// + (h >= 0 ? '+' : '') + h.toFixed(2) + '% RH' + '<br/>'

		//Update the value displayed.
		// displayValue('HumidityData', string)
	}

	function magnetometerHandler(data) {
		// Calculate the magnetometer values from raw sensor data.
		var values = sensortag.getMagnetometerValues(data)
		//Update the value displayed.
		self.model.set({
			mag_Raw:  bufferToHexStr(data, 0, 3), 
			mag_x: values.x.toFixed(5),
			mag_y: values.y.toFixed(5),
			mag_z: values.z.toFixed(5)
		});
	}
	
	function lockHandler(data) {
		// Calculate the magnetometer values from raw sensor data.
		var values = sensortag.getLockValues(data)
		//Update the value displayed.
		self.model.set({
			mag_Raw:  bufferToHexStr(data, 0, 3), 
			mag_x: values.x.toFixed(5),
			mag_y: values.y.toFixed(5),
			mag_z: values.z.toFixed(5)
		});
	}

	function barometerHandler(data) {
		// Prepare the information to display.
		// string =
			// 'raw: 0x' + bufferToHexStr(data, 0, 4) + '<br/>'

		// Update the value displayed.
		// displayValue('BarometerData', string)

		// Calculated values not implemented yet.
	}

	function gyroscopeHandler(data) {
		// Calculate the gyroscope values from raw sensor data.
		var values = sensortag.getGyroscopeValues(data)
		var x = values.x
		var y = values.y
		var z = values.z

		// Prepare the information to display.
		// string =
			// 'raw: 0x' + bufferToHexStr(data, 0, 6) + '<br/>'
			// + 'x = ' + (x >= 0 ? '+' : '') + x.toFixed(5) + '<br/>'
			// + 'y = ' + (y >= 0 ? '+' : '') + y.toFixed(5) + '<br/>'
			// + 'z = ' + (z >= 0 ? '+' : '') + z.toFixed(5) + '<br/>'

		// Update the value displayed.
		// displayValue('GyroscopeData', string)
	}

	function displayValue(elementId, value)
	{
		document.getElementById(elementId).innerHTML = value
	}

	function setBackgroundColor(color)
	{
		document.documentElement.style.background = color
		document.body.style.background = color
	}

		


	function base64_decode(data) {
	  var b64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
	  var o1, o2, o3, h1, h2, h3, h4, bits, i = 0,
		ac = 0,
		dec = '',
		tmp_arr = [];

	  if (!data) {
		return data;
	  }

	  data += '';

	  do { // unpack four hexets into three octets using index points in b64
		h1 = b64.indexOf(data.charAt(i++));
		h2 = b64.indexOf(data.charAt(i++));
		h3 = b64.indexOf(data.charAt(i++));
		h4 = b64.indexOf(data.charAt(i++));

		bits = h1 << 18 | h2 << 12 | h3 << 6 | h4;

		o1 = bits >> 16 & 0xff;
		o2 = bits >> 8 & 0xff;
		o3 = bits & 0xff;
			if (h3 == 64) {
				tmp_arr[ac++] = o1;
			} else if (h4 == 64) {
				tmp_arr[ac++] = o1;
				tmp_arr[ac++] = o2;
		} else {
				tmp_arr[ac++] = o1;
				tmp_arr[ac++] = o2;
				tmp_arr[ac++] = o3;			
			}
	  } while (i < data.length);
	  return tmp_arr;
	}

	

	/**
	 * Convert byte buffer to hex string.
	 * @param buffer - an Uint8Array
	 * @param offset - byte offset
	 * @param numBytes - number of bytes to read
	 * @return string with hex representation of bytes
	 */
	function bufferToHexStr(buffer, offset, numBytes)
	{
		var hex = ''
		for (var i = 0; i < numBytes; ++i)
		{
			hex += byteToHexStr(buffer[offset + i])
		}
		return hex
	}

	/**
	 * Convert byte number to hex string.
	 */
	function byteToHexStr(d)
	{
		if (d < 0) { d = 0xFF + d + 1 }
		var hex = Number(d).toString(16)
		var padding = 2
		while (hex.length < padding)
		{
			hex = '0' + hex
		}
		return hex
	}


}