(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
window.onload = function () {

    var width = window.innerWidth * window.devicePixelRatio;
    var height = window.innerHeight * window.devicePixelRatio;

    if (window.devicePixelRatio == 1)
        var game = new Phaser.Game(960, 640, Phaser.WEB_GL, '');
    else
        var game = new Phaser.Game(width / (window.devicePixelRatio - 1), height / (window.devicePixelRatio - 1), Phaser.WEB_GL, '');

    game.state.add('Boot', require('./states/Boot'));
    game.state.add('Preloader', require('./states/Preloader'));
    game.state.add('MainMenu', require('./states/MainMenu'));
    game.state.add('Main', require('./states/Main'));

    game.state.start('Boot');
};


},{"./states/Boot":2,"./states/Main":3,"./states/MainMenu":4,"./states/Preloader":5}],2:[function(require,module,exports){
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



},{}],3:[function(require,module,exports){
function Main() {}

Main.prototype = {

    create: function() {

        var _game;

        _game = this.game;

        _game.world.setBounds(0, 0, 1960, 640);

        // Create mouse events
        _game.input.onUp.add(this.touchInputUp, this);
        _game.input.onDown.add(this.touchInputDown, this);

        // Assign state variables
        this.buildHash = window.location.hash;

        console.log(this.buildHash);

        this.timer = _game.time.create(true);

    },

    update: function() {
    },

    touchInputDown: function() {
    },

    touchInputUp: function() {
    },

    newArray: function(size) {

        var array;
        var i;

        array = new Array(size);
        i = 0;
        while (i < size) {

            array[i] = 0;
            i++;
        }

        return array;
    }
};

module.exports = Main;
},{}],4:[function(require,module,exports){
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
},{}],5:[function(require,module,exports){
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
},{}]},{},[1])