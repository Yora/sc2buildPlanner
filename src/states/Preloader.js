function Preloader () {
}

Preloader.prototype = {

	preload: function() {

		this.game.advancedTiming = true;

		var fileFormat = (this.game.device.cocoonJS) ? '.json' : '.xml';

		this.load.image('icon', 'assets/icon.png');
		this.load.image('ui-units', 'assets/ui-units.png');
		this.load.image('ui-topRight', 'assets/ui-topRight.png');
		this.load.image('ui-timer', 'assets/ui-timer.png');
		this.load.image('ui-resources', 'assets/ui-resources.png');
		this.load.image('ui-resources-end', 'assets/ui-resources-end.png');
		this.load.image('scroll-bar', 'assets/scroll-bar.png');
		this.load.image('scrolling-bar', 'assets/scrolling-bar.png');
		this.load.image('stars', 'assets/stars.png');
		//this.load.bitmapFont('Agency_35', 'assets/fonts/agency_35_0.png', 'assets/fonts/agency_35' + fileFormat);
		this.load.bitmapFont('Agency_35', 'assets/fonts/agency_35_0.png', 'assets/fonts/agency_35.xml');

		this.load.image('time1', 'assets/time1.png');
		this.load.image('time2', 'assets/time2.png');
		this.load.image('time3', 'assets/time3.png');


	},
	create: function() {

		this.game.state.start('MainMenu');

	}
};

module.exports = Preloader;