
// wait for scripts to load before starting otherwise you get undefined errors
document.addEventListener(
	'deviceready', function() { evothings.scriptsLoaded(myFunction)},
	false
)

var myFunction = function () {
    // Global views
    HomeView.prototype.template = Handlebars.compile($("#home-tpl").html());
    DeviceListView.prototype.template = Handlebars.compile($("#device-list-tpl").html());
    DeviceView.prototype.template = Handlebars.compile($("#device-tpl").html());
		
    /* ---------------------------------- Local Variables ---------------------------------- */
    var slider = new PageSlider($('body'));

	var devices = new DeviceCollection(
				[
				{id: 0, "address": 1, "rssi": 10, "name": "Albert", "scanRecord": "ABCDE",     timeStamp: Date.now()},
				{id: 1, "address": 2, "rssi": 20, "name": "King",   "scanRecord": "FGHIJK",    timeStamp: Date.now()},
				{id: 2, "address": 3, "rssi": 30, "name": "Carol",  "scanRecord": "LMNOPQ",    timeStamp: Date.now()},
				{id: 3, "address": 4, "rssi": 40, "name": "Tinker", "scanRecord": "RSTUVWXYZ", timeStamp: Date.now()},
			]
	);
	var tag = new SensorTagService();
	
	HomeView.prototype.tag = tag; 
	
	//ble.initialize().done(function () { 
	//	console.log('ble initialised');
	//});
	
	tag.initialiseSensorTag();
	console.log('initialiseSensorTag');
    var AppRouter = Backbone.Router.extend({

        routes: {
            "":                         "home",
            "devices/:address":         "deviceDetails",
			"ir_graph/:address":		"graphIR"
        },

        home: function () {
			console.log('creating HomeView');
            var homeView = new HomeView({collection: devices});
			this.loadView(homeView.render());
            slider.slidePage(homeView.$el);
        },

        deviceDetails: function (address) {
			var device = {};
            console.log('creating DeviceView');   
			var deviceView = new DeviceView({ble: tag, address: address});
            this.loadView(deviceView.render());
            slider.slidePage(deviceView.$el);
        },
		
        graphIR: function (address) {
			var device = {};
            console.log('creating graphIR');   
			var deviceView = new DeviceView({ble: tag, address: address});
            this.loadView(deviceView.render());
            slider.slidePage(deviceView.$el);
        },
		
		loadView : function(view) {
			// first close and remove the existing view
			this.view && this.view.close();
			this.view = view;
		}
		
    });

    var router = new AppRouter();
    Backbone.history.start();

    /* --------------------------------- Event Registration -------------------------------- */
	
	// what is this for??? JN
    document.addEventListener('deviceready', function () {
        FastClick.attach(document.body);
        if (navigator.notification) { // Override default HTML alert with native dialog
            window.alert = function (message) {
                navigator.notification.alert(
                    message,    // message
                    null,       // callback
                    "Workshop", // title
                    'OK'        // buttonName
                );
            };
        }
    }, false);

    /* ---------------------------------- Local Functions ---------------------------------- */

};
