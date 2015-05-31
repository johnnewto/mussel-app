var DeviceListView = Backbone.View.extend({

    tagName:'ul',

    className:'table-view',
    
		
	initialize: function() {
		this.listenTo(this.model, 'change', this.render);  
	},

	
    render: function() {
        this.$el.html(this.template(this.model.attributes));
      	return this;
    },
	
	close: function () {
		console.log('closing DeviceListView: ', this.cid);
		this.remove();		
	 },
	

});


