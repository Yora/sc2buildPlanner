function Preloader () {
}

Preloader.prototype = {

	preload: function() {

		this.game.advancedTiming = true;

		var fileFormat = (this.game.device.cocoonJS) ? '.json' : '.xml';

		this.load.image('icon', 'assets/icon.png');
		this.load.image('stars', 'assets/stars.png');
		this.load.image('stars-cover', 'assets/stars-cover.png');
		this.load.bitmapFont('Agency_35', 'assets/fonts/agency_35_0.png', 'assets/fonts/agency_35.xml');
	},
	create: function() {

		this.game.state.start('MainMenu');

	}
};

module.exports = Preloader;