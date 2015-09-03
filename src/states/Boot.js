function Boot () {
}

Boot.prototype = {
	preload: function() {
		this.load.image('loaderEmpty', 'assets/loaderEmpty.png');
		this.load.image('loaderFull', 'assets/loaderFull.png');
	},
	create: function() {

		if (this.game.device.desktop) {

		    this.game.scale.scaleMode = Phaser.ScaleManager.RESIZE;
		    //this.game.scale.pageAlignHorizontally = true;
		    //this.game.scale.pageAlignVertically = true;
		    //this.game.scale.windowConstraints.bottom = 'visual';
		    //this.game.scale.windowConstraints.right = 'visual';
		    this.game.scale.minWidth = 960;
		    this.game.scale.minHeight = 640;
		    this.game.scale.maxWidth = 2220;


		    //this.game.scale.onSizeChange.add(function () {this.game.scale.setGameSize(window.innerWidth, window.innerHeight)}, this)

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


