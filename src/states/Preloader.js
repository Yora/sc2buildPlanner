function Preloader () {
}

Preloader.prototype = {

	preload: function() {

		//this.game.advancedTiming = true;

		//var fileFormat = (this.game.device.cocoonJS) ? '.json' : '.xml';

		this.load.image('ui-white-square', 'assets/ui-white-square.png');
		this.load.image('ui-blue-timeline-bar', 'assets/ui-blue-timeline-bar.png');
		this.load.image('ui-green-square', 'assets/ui-green-square.png');
		//this.load.image('stars', 'assets/stars.png');
		//this.load.image('stars-cover', 'assets/stars-cover.png');

		this.load.bitmapFont('Agency_35', 'assets/fonts/agency_35_letters_0.png', 'assets/fonts/agency_35_letters.json' /*+ fileFormat*/);
		this.load.bitmapFont('Agency_35_nums', 'assets/fonts/agency_35_nums_0.png', 'assets/fonts/agency_35_nums.json' /*+ fileFormat*/);


		//this.load.bitmapFont('Agency_15', 'assets/fonts/agency_15_num.png', 'assets/fonts/agency_15_num.json' /*+ fileFormat*/);

	},
	create: function() {

		this.game.state.start('MainMenu');

	}
};

module.exports = Preloader;