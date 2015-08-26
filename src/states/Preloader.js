function Preloader () {
}

Preloader.prototype = {

	preload: function() {

		this.game.advancedTiming = true;

		this.load.image('icon', 'assets/icon.png');
		this.load.image('ui-units', 'assets/ui-units.png');

	},
	create: function() {

		this.game.state.start('MainMenu');

	}
};

module.exports = Preloader;