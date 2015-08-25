function Boot () {
}

Boot.prototype = {
	preload: function() {
		this.load.image('loaderEmpty', 'assets/loaderEmpty.png');
		this.load.image('loaderFull', 'assets/loaderFull.png');
	},
	create: function() {

		if (this.game.device.desktop) {

		    this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
		    this.game.scale.maxWidth = 960;
		    this.game.scale.maxHeight = 640;
		    this.game.scale.pageAlignHorizontally = true;
		    this.game.scale.pageAlignVertically = true;
		} else {

		    this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
		    this.game.scale.setShowAll();
		    this.game.scale.pageAlignHorizontally = true;
		    this.game.scale.pageAlignVeritcally = true;
		    this.game.scale.refresh();
			}

		this.game.state.start('Preloader');
	}
};

module.exports = Boot;


