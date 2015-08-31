function Preloader () {
}

Preloader.prototype = {

	preload: function() {

		this.game.advancedTiming = true;

		this.load.image('icon', 'assets/icon.png');
		this.load.image('ui-units', 'assets/ui-units.png');
		this.load.image('scroll-bar', 'assets/scroll-bar.png');
		this.load.image('scrolling-bar', 'assets/scrolling-bar.png');
		this.load.image('stars', 'assets/stars.png');


	},
	create: function() {

		this.game.state.start('MainMenu');

	}
};

module.exports = Preloader;