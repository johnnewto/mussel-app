(function () {
	// local variables
	var self;  // helps with event binding
	var ble;
	var device;
	var volts = 10.4;

	DeviceView = Backbone.View.extend({
		
		initialize: function (options) {
			self = this;
			//this.displayStatus = _.bind(this.displayStatus, this);
			this.options = options || {};   // options holds extra passed variables
			ble = options.ble;
			// find the device to display
			device = {};
			$.each(options.ble.devices, function(key, _device) {
				if(key == options.address)
					device = _device;
			});
			
			this.model = new Backbone.Model();
			
			this.model.set({
				address: device.address, 
				name: device.name, 
				rssi: device.rssi,
				scanRecord: device.scanRecord,
				volts: volts,
				statusMessage: "...", 
				color: "red"

			});
			
			this.listenTo(this.model, 'change', this.render);  
			
			this.onDoConnectButton();
		},

		render: function () {
			this.$el.html(this.template(this.model.attributes));
			return this;
		},

		close: function () {
			console.log('Closing DeviceView: ', this.cid);
			ble.sensortag.disconnectDevice();
			this.remove();		

		 },
		
		events: {
			"click .do-connect": 	"onDoConnectButton",
			"click .do-blue": 		"onDoBlueButton",
			"click .btn-volts-up": 	"onVoltsUpButton",
			"click .btn-volts-down": 	"onVoltsDownButton",
			
		},
		
		// Display a status message
		displayStatus: function(message) {
			this.model.set({
				statusMessage: message, 
			});
		},
		
		onDoConnectButton: function() { 
			// connect to device and report back to this model
			ble.connectToDevice(device, self.model);
			self.displayStatus("Connected");
		},
		
		onDoBlueButton: function() { 
			console.log("blue");
			self.displayStatus("blue pressed");
			self.model.set({color: 'blue'});

		},
		
		onVoltsUpButton: function() { 
			volts = volts + 0.1;
			self.model.set({volts: volts.toFixed(2)});
			ble.sensortag.magnetometerPeriod(2000);
			ble.sensortag.irTemperaturePeriod(2000);
			ble.sensortag.irTemperatureReadPeriod(
				function(data)
				{
				    var d = new Uint8Array(data);
					console.log('BLE characteristic data: ' + d[0]);
					self.model.set({volts: d[0]});
				}
			);			
		},
		
		onVoltsDownButton: function() { 
			volts = volts + 0.1;
			//self.model.set({volts: volts.toFixed(2)});
			ble.sensortag.magnetometerPeriod(500);
			ble.sensortag.irTemperaturePeriod(500);
			ble.sensortag.irTemperatureReadPeriod(
				function(data)
				{
				    var d = new Int8Array(data);
					console.log('BLE characteristic data: ' + d[0]);
					self.model.set({volts: d[0]});
				}
			);			
		},		
	});
	
}());