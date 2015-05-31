
(function () {
	// local variables
	var self;  // helps with event binding

	var updateTimer;
	// 
	HomeView = Backbone.View.extend({  // Global
	  //perhaps updateTimer should be here?
		initialize: function () {
			self = this;
			// Bind displayDeviceList as this is called by updateTimer 

			//this.displayDeviceList = _.bind(this.displayDeviceList, this);
			evothings.easyble && evothings.easyble.closeConnectedDevices(); 
			
			this.model = new Backbone.Model();
			
			this.model.set({
				statusMessage: "Scanning Paused", 
			});
			
			// render when the model is change, i.e. new status message
			this.listenTo(this.model, 'change', this.render);
			// render when a model is added or removed from the collection
			this.listenTo(this.collection, 'add', this.render);
			this.listenTo(this.collection, 'remove', this.render);
			
			this.onStartScanButton();	
		},

		render: function () {
			// render header and footer
			this.$el.html(this.template(this.model.attributes));
			
			// render list of devices in body
			this.collection.each(function(device){
				var listView = new DeviceListView({ model: device });
				$('.content', this.el).append(listView.render().el);
			}, this);
			
			return this;
		},
		
		close: function () {
			// on exit this view 
			clearInterval(updateTimer); 
			this.onStopScanButton();
			console.log('closing HomeView ', this.cid);
			this.remove();		
		 },
		 

		events: {
			"keyup .search-key":    "findByName",
			"keypress .search-key": "onkeypress",
			"click .start-scan": "onStartScanButton",
			"click .stop-scan": "onStopScanButton"
		},
			
		findByName: function(event) {
			var key = $('.search-key').val();
			console.log(key);
			var _devices = this.collection.findByName(key);
			this.listView.setDevices(_devices);
		},

		onkeypress: function (event) {
			if (event.keyCode === 13) { // enter key pressed
				event.preventDefault();
			}
		},
			
		onStartScanButton: function() { 
			this.tag.startScan(); 
			this.displayStatus('Scanning...');  
			clearInterval(updateTimer);
			updateTimer = setInterval(this.tag.displayDeviceList, 1000, self.collection);
		},
		
		onStopScanButton: function() {
			this.tag.stopScan();
			this.tag.devices = {};
			this.displayStatus('Scanning Paused');
			//self.displayDeviceList();
			clearInterval(updateTimer);
		},
		
		
		// Display a status message
		displayStatus: function(message) {
			this.model.set({
				statusMessage: message, 
			});
			
		},
	});


}());