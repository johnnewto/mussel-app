var Device = Backbone.Model.extend({

    defaults: {
			id: "", address: "", name: "", rssi: "", scanRecord: "", manuData: ""
    },

});


var DeviceCollection = Backbone.Collection.extend({

    model: Device,
		
    initialize: function () {
		localStorage.setItem("devices", JSON.stringify(
			[
				{"id": 1, "address": 1, "rssi": 10, "name": "Albert", "scanRecord": "ABCDE", },
				{"id": 2, "address": 1, "rssi": 20, "name": "King", "scanRecord": "FGHIJK", },
				{"id": 3, "address": 1, "rssi": 30, "name": "Carol", "scanRecord": "LMNOPQ", },
				{"id": 4, "address": 1, "rssi": 40, "name": "Tinker", "scanRecord": "RSTUVWXYZ", },
			]
		));
//		this.add(
//			[
//				{"id": 1, "address": 1, "rssi": 10, "name": "Albert", "scanRecord": "ABCDE", },
//				{"id": 2, "address": 1, "rssi": 20, "name": "King", "scanRecord": "FGHIJK", },
//				{"id": 3, "address": 1, "rssi": 30, "name": "Carol", "scanRecord": "LMNOPQ", },
//				{"id": 4, "address": 1, "rssi": 40, "name": "Tinker", "scanRecord": "RSTUVWXYZ", },
//			]
//		);
    },

	// Store sample data in Local Storage
//	localStorage: new Backbone.LocalStorage('devices'),  

    findByName: function (searchKey) {
		devices = JSON.parse(localStorage.getItem("devices")),
		results = devices.filter(function (element) {
			//var fullName = element.firstName + " " + element.lastName;
			return element.name.toLowerCase().indexOf(searchKey.toLowerCase()) > -1;
		});
		return results;
    },
	
    _findByName: function (searchKey) {
		devices = this.models;
		results = devices.filter(function (element) {
			//var fullName = element.firstName + " " + element.lastName;
			return element.attributes.name.toLowerCase().indexOf(searchKey.toLowerCase()) > -1;
		});
		return results;
    },
		
	findById: function (id) {
		devices = JSON.parse(window.localStorage.getItem("devices")),
		employee = null,
		l = devices.length;

		for (var i = 0; i < l; i++) {
			if (devices[i].id === id) {
				employee = devices[i];
				break;
			}
		}

		return employee;
	}
		
});
