function MainMenu () {
}

MainMenu.prototype = {

	create: function() {

		this.add.sprite(0, 0, 'loaderEmpty');
		this.startButton = this.add.button(this.game.width / 2, 200, 'loaderFull', this.startGame, this, 2, 0, 1);
		this.startButton.anchor.set(0.5,0);
	},

	startGame: function() {

		this.game.state.start('Main');
	}
};

module.exports = MainMenu;