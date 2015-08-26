(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
window.onload = function () {

    var width = window.innerWidth * window.devicePixelRatio;
    var height = window.innerHeight * window.devicePixelRatio;

    var desktopWidth = window.innerWidth;
    var desktopHeight = 640; //window.innerHeight;


    if (window.devicePixelRatio == 1)
        var game = new Phaser.Game(desktopWidth, desktopHeight, Phaser.WEB_GL, 'game');
        //var game = new Phaser.Game(960, 640, Phaser.WEB_GL, '');
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

		    this.game.scale.scaleMode = Phaser.ScaleManager.RESIZE;
		    //this.game.scale.pageAlignHorizontally = true;
		    //this.game.scale.pageAlignVertically = true;
		    //this.game.scale.windowConstraints.bottom = 'visual';
		    //this.game.scale.windowConstraints.right = 'visual';
		    this.game.scale.minWidth = 960;
		    this.game.scale.minHeight = 640;


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



},{}],3:[function(require,module,exports){
function Main() {}

// resizing - if width is too small, start to move the building UI off the side and make more room for timeline

Main.prototype = {

    init: function(race) {

        this.race = race;

    },

    preload: function () {

        switch (this.race) {

            case 'terran':
            this.game.load.atlas('terran', 'assets/terran.png', 'assets/terran.json');
            break;

            case 'protoss':
            this.game.load.atlas('protoss', 'assets/protoss.png', 'assets/protoss.json');
            break;

            case 'zerg':
            this.game.load.atlas('zerg', 'assets/zerg.png', 'assets/zerg.json');
            break;

        }

    },

    create: function() {

        var _game;

        _game = this.game;

        _game.world.setBounds(0, 0, 1960, 640);
        _game.scale.onSizeChange.add(this.scaleChange, this);


        // Create mouse events
        _game.input.onUp.add(this.touchInputUp, this);
        _game.input.onDown.add(this.touchInputDown, this);


        // Assign state variables
        this.buildHash = window.location.hash;
        this.unitCount = 0;
        this.structureCount = 0;

        this.unitGroupUI = this.game.add.group();

        this.initRace();

        this.initUI();

        this.createUnits();

        this.timer = _game.time.create(true);

    },

    update: function() {
    },

    scaleChange: function() {

        this.unitGroupUI.x = this.game.width - this.unitGroupUI.width;
    },

    touchInputDown: function() {
    },

    touchInputUp: function() {
    },

    initRace: function() {

        var race;

        race = this.race;

        switch (race) {

            case 'terran':
            this.unitCount = 15;
            this.structureCount = 17;
            break;

            case 'protoss':
            this.unitCount = 20;
            this.structureCount = 14;
            break;

            case 'zerg':
            this.unitCount = 18;
            this.structureCount = 18;
            break;

        }
    },

    initUI: function() {

        var unitUI;

        unitUI = this.game.add.sprite(0, 0, 'ui-units');
        unitUI.width = 300;
        unitUI.height = this.game.height;
        this.unitGroupUI.add(unitUI);

        this.unitGroupUI.x = this.game.width - this.unitGroupUI.width;
    },

    createUnits: function() {

        var xx;
        var yy;
        var x;
        var y;
        var index;
        var texture;
        var icon;

        index = 0;

        for (yy = 0; yy < 7; yy++) {
            for (xx = 0; xx < 4; xx++) {

                index++;

                if (index > this.unitCount)
                    return;

                x = 15 + xx * 62 + (xx * 7);
                y = 16 + yy * 62 + (yy * 7);

                icon = this.game.add.sprite(x - 3, y - 2, 'icon');
                icon.width = 66;
                icon.height = 66;
                //icon.tint = 0xff0000;

                this.unitGroupUI.add(icon);

                texture = this._getTexture(index);

                this._createUnit(x, y, texture);

            }
        }

    },

    _getTexture: function(index) {

        var texture;

        if (this.race === 'terran')
            switch (index) {

                case 1:
                texture = 'scv';
                break;

                case 2:
                texture = 'reaper';
                break;

                case 3:
                texture = 'marauder';
                break;

                case 4:
                texture = 'ghost';
                break;

                case 5:
                texture = 'hellion';
                break;

                case 6:
                texture = 'widow-mine';
                break;

                case 7:
                texture = 'siege-tank';
                break;

                case 8:
                texture = 'cyclone';
                break;

                case 9:
                texture = 'thor';
                break;

                case 10:
                texture = 'viking';
                break;

                case 11:
                texture = 'medivac';
                break;

                case 12:
                texture = 'liberator';
                break;

                case 13:
                texture = 'raven';
                break;

                case 14:
                texture = 'banshee';
                break;

                case 15:
                texture = 'battlecruiser';
                break;
            }

        else if (this.race === 'protoss')
            switch (index) {

                case 1:
                texture = 'probe';
                break;

                case 2:
                texture = 'zealot';
                break;

                case 3:
                texture = 'adept';
                break;

                case 4:
                texture = 'sentry';
                break;

                case 5:
                texture = 'stalker';
                break;

                case 6:
                texture = 'dark-templar';
                break;

                case 7:
                texture = 'high-templar';
                break;

                case 8:
                texture = 'archon';
                break;

                case 9:
                texture = 'observer';
                break;

                case 10:
                texture = 'void-prism';
                break;

                case 11:
                texture = 'immortal';
                break;

                case 12:
                texture = 'collosus';
                break;

                case 13:
                texture = 'disruptor';
                break;

                case 14:
                texture = 'phoenix';
                break;

                case 15:
                texture = 'void-ray';
                break;

                case 16:
                texture = 'oracle';
                break;

                case 17:
                texture = 'tempest';
                break;

                case 18:
                texture = 'carrier';
                break;

                case 19:
                texture = 'mothership-core';
                break;

                case 20:
                texture = 'mothership';
                break;
            }

        else if (this.race === 'zerg')
            switch (index) {

                case 1:
                texture = 'larva';
                break;

                case 2:
                texture = 'drone';
                break;

                case 3:
                texture = 'zergling';
                break;

                case 4:
                texture = 'baneling';
                break;

                case 5:
                texture = 'roach';
                break;

                case 6:
                texture = 'ravager';
                break;

                case 7:
                texture = 'hydralisk';
                break;

                case 8:
                texture = 'lurker';
                break;

                case 9:
                texture = 'viper';
                break;

                case 10:
                texture = 'mutalisk';
                break;

                case 11:
                texture = 'corruptor';
                break;

                case 12:
                texture = 'swarm-host';
                break;

                case 13:
                texture = 'infestor';
                break;

                case 14:
                texture = 'ultralisk';
                break;

                case 15:
                texture = 'broodlord';
                break;

                case 16:
                texture = 'overlord';
                break;

                case 17:
                texture = 'overseer';
                break;

                case 18:
                texture = 'queen';
                break;
            }

        return texture;
    },

    _createUnit: function(x, y, texture) {

        var sprite;

        sprite = this.game.make.button(x, y, this.race, this.unitPressed, this, texture + "-highlight", texture, texture, texture);

        this.unitGroupUI.add(sprite);

    },

    unitPressed: function() {

        //console.log(this)

    },

    highlightUnit: function(unit, fun, string) {

        if (string === 'over')
            unit.tint = 0x86bfda;
        else if (string === 'out')
            unit.tint = 0xffffff;

        console.log(string)
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

		this.game.state.start('Main', true, false, 'terran');
	},

	startGame: function() {

		this.game.state.start('Main', true, false, 'terran');
	}
};

module.exports = MainMenu;
},{}],5:[function(require,module,exports){
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
},{}]},{},[1])