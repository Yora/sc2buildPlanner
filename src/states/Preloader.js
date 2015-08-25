function Preloader () {
}

Preloader.prototype = {

	preload: function() {

		this.game.advancedTiming = true;

	},
	create: function() {

		this.game.state.start('Main');

	}
};

module.exports = Preloader;