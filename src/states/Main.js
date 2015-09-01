function Main() {}

// resizing - if width is too small, start to move the building UI off the side and make more room for timeline

// next setup all upgrades, as well as minerals, gas, supply, energy, larva, etc

// have an array of constructing buildings and constructed buildings

// base allowed buildings off constructed buildings array.  Fade out things that cant be made yet

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
        _game.scale.onSizeChange.add(this.scaleUpdate, this);
        _game.input.justReleasedRate = 10;


        // Create mouse events
        _game.input.onUp.add(this.touchInputUp, this);
        _game.input.onDown.add(this.touchInputDown, this);


        // Assign state variables
        this.buildHash = window.location.hash;
        this.unitCount = 0;
        this.structureCount = 0;
        this.maxScrollCount = 0;
        this.isScrolling = false;
        this.scrollDifference = 0;
        this.maxRowsOnScreen = 0;

        this.bg = this.game.add.sprite(0, 0, 'stars')
        this.bg.alpha = 0.2;

        this.unitGroupUI = this.game.add.group();
        this.structureGroupUI = this.game.add.group();
        this.upgradeGroupUI = this.game.add.group();

        this.initUI();

        this.initRace();
 
        this.createUnits();

        this.createStructures();

        this.createUpgrades();

        this.startUI();

        this.world.bringToTop(this.selectionUI);

        this.timer = _game.time.create(true);
    },

    update: function() {

        if (this.isScrolling) {

            var scrollValue;
            var _scrollingBar;
            var _game;
            var _unitGroupUI;
            var _structureGroupUI;
            var _upgradeGroupUI;

            _scrollingBar = this.scrollingBar;
            _game = this.game;
            _unitGroupUI = this.unitGroupUI;
            _structureGroupUI = this.structureGroupUI;
            _upgradeGroupUI = this.upgradeGroupUI;

            scrollValue = (_game.input.activePointer.y - _scrollingBar.y);

            if (scrollValue >= _scrollingBar.height)
                scrollValue = _scrollingBar.height;

            // follow input with scroll bar
            _scrollingBar.y = _game.input.activePointer.y - this.scrollDifference;


            // scroll bar at top
            if (_scrollingBar.y < 0) 
                _scrollingBar.y = 0;

            // scroll bar at bottom
            else if (_scrollingBar.y > (_game.height - _scrollingBar.height)) 
                _scrollingBar.y = (_game.height - _scrollingBar.height);

            //_unitGroupUI.y = -_scrollingBar.y - 5
            //_structureGroupUI.y = -_scrollingBar.y + _unitGroupUI.getTop().y + 54
            //_upgradeGroupUI.y = -_scrollingBar.y +  _structureGroupUI.height + _unitGroupUI.height + 12

            //_unitGroupUI.y = -_scrollingBar.y - 5 * ((640 - this.game.height) / 68);
            //_structureGroupUI.y = -_scrollingBar.y + _unitGroupUI.getTop().y + 54 * ((640 - this.game.height) / 68);
            //_upgradeGroupUI.y = -_scrollingBar.y +  _structureGroupUI.height + _unitGroupUI.height + 12 * ((640 - this.game.height) / 68);

            //console.log((-((_scrollingBar.y/* - 5*/) * (1 + ((640 - this.game.height) / 640)))));

            //console.log((1 + ((640 - this.game.height - _scrollingBar.height) / 640)));

            var percent = this.game.height - (this.scrollingBar.y + this.scrollingBar.height);

            console.log(percent)

            var totalPercent = (1 + (this.game.height / (this.unitGroupUI.height + this.structureGroupUI.height + this.upgradeGroupUI.height - 20)));

            //_unitGroupUI.y = -((_scrollingBar.y/* - 5*/) * (1 + ((640 - this.game.height) / 640)));// - (((640 - this.game.height) / 100) * _scrollingBar.y);
            //_unitGroupUI.y = -_scrollingBar.y;
            //_unitGroupUI.y = -((_scrollingBar.y/* - 5*/) * (1 + ((640 - this.game.height) / (640 - _scrollingBar.height))));// - (((640 - this.game.height) / 100) * _scrollingBar.y);
            _unitGroupUI.y = -_scrollingBar.y * (totalPercent);
            _structureGroupUI.y = _unitGroupUI.y + _unitGroupUI.height + 10;
            _upgradeGroupUI.y = _unitGroupUI.y + _unitGroupUI.height + _structureGroupUI.height + 20;

            //console.log(_unitGroupUI.y);

            //console.log((this.game.height / (_unitGroupUI.height + _structureGroupUI.height + _upgradeGroupUI.height + 20)) - 68);
        }
    },

    scaleUpdate: function() {

        this.selectionUI.x = this.game.width - this.selectionUI.width - 25;
        this.scrollBar.x = this.game.width - this.scrollBar.width;
        this.scrollingBar.x = this.game.width - this.scrollingBar.width;
        this.unitGroupUI.x = this.selectionUI.x - 5;
        this.structureGroupUI.x = this.selectionUI.x - 5;
        this.upgradeGroupUI.x = this.selectionUI.x - 5;
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
            this.upgradeCount = 25;
            break;

            case 'protoss':
            this.unitCount = 20;
            this.structureCount = 14;
            this.upgradeCount = 24;
            break;

            case 'zerg':
            this.unitCount = 18;
            this.structureCount = 18;
            this.upgradeCount = 28;
            break;

        }
    },

    initUI: function() {

        this.selectionUI = this.game.add.sprite(0, 0, 'ui-units');
        this.selectionUI.width = 290;
        this.selectionUI.height = this.game.height;

        this.scrollingBar = this.game.add.button(0, 0, 'scrolling-bar', this._scrollBar, this);
        this.scrollingBar.width += 10;

        this.scrollBar = this.game.add.button(0, 0, 'scroll-bar', this._scrollBar, this);
        this.scrollBar.height = this.game.height;
        this.scrollBar.onInputDown.add(this._scrollBar, this);
        this.scrollBar.width += 10;

        this.maxRowsOnScreen = Math.floor(this.game.height / 69);

        console.log(this.maxRowsOnScreen);

        this.scaleUpdate();
    },

    startUI: function() {

        this.selectionUI.x = this.game.width - this.selectionUI.width - 25;
        this.scrollBar.x = this.game.width - this.scrollBar.width;
        this.scrollingBar.x = this.game.width - this.scrollingBar.width;
        this.unitGroupUI.x = this.selectionUI.x - 5;
        this.structureGroupUI.x = this.selectionUI.x - 5;
        this.upgradeGroupUI.x = this.selectionUI.x - 5;

        //this.scrollingBar.height = this.game.height - ((this.maxScrollCount - this.maxRowsOnScreen) * 69) - 20; // 20 = small gaps between types
        //this.scrollingBar.height = this.game.height * (this.game.height / (this.unitGroupUI.height + this.structureGroupUI.height + this.upgradeGroupUI.height))
        //this.scrollingBar.height = (this.unitGroupUI.height + this.structureGroupUI.height + this.upgradeGroupUI.height) - this.game.height - (this.maxScrollCount * 2);

        //this.scrollingBar.height = this.game.height - (this.game.height / (this.game.height - (this.unitGroupUI.height + this.structureGroupUI.height + this.upgradeGroupUI.height))) 

        this.scrollingBar.height = this.game.height * (1 - (this.game.height / (this.unitGroupUI.height + this.structureGroupUI.height + this.upgradeGroupUI.height - 20))) 

        //console.log(((this.game.height / (this.unitGroupUI.height + this.structureGroupUI.height + this.upgradeGroupUI.height - 20))))

        //console.log(((640 - this.game.height) / 68))
        //this.scrollingBar.height *= (((640 - this.game.height) / 68));
    },

    _scrollBar: function() {

        var scrollValue;

        this.isScrolling = !(this.isScrolling);

        if (!this.isScrolling) {

            this.scrollingBar.anchor.setTo(0, 0);
            return;
        }

        scrollValue =  (this.game.input.activePointer.y - this.scrollingBar.y);

        this.scrollDifference = scrollValue;
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

        this.unitGroupUI.x = this.selectionUI.x;

        for (yy = 0; yy <= 7; yy++) {

            if (index + 1 > this.unitCount)
                return;

            this.maxScrollCount++;

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

                texture = this._getUnitTexture(index);

                this._createEntity(x, y, texture, this.unitGroupUI);

            }
        }
    },

    createStructures: function() {

        var xx;
        var yy;
        var x;
        var y;
        var index;
        var texture;
        var icon;

        index = 0;

        //this.structureGroupUI.y = this.unitGroupUI.getTop().y + 54;
        this.structureGroupUI.y = this.unitGroupUI.y + this.unitGroupUI.height + 10;


        for (yy = 0; yy <= 7; yy++) {

            if (index + 1 > this.structureCount)
                return;

            this.maxScrollCount++;

            for (xx = 0; xx < 4; xx++) {

                index++;

                if (index > this.structureCount)
                    return;

                x = 15 + xx * 62 + (xx * 7);
                y = 16 + yy * 62 + (yy * 7);

                icon = this.game.add.sprite(x - 3, y - 2, 'icon');
                icon.width = 66;
                icon.height = 66;
                //icon.tint = 0xff0000;

                this.structureGroupUI.add(icon);

                texture = this._getStructureTexture(index);

                this._createEntity(x, y, texture, this.structureGroupUI);

            }
        }
    },

    createUpgrades: function() {

        var xx;
        var yy;
        var x;
        var y;
        var index;
        var texture;
        var icon;

        index = 0;

        //this.upgradeGroupUI.y = this.structureGroupUI.y + this.structureGroupUI.getTop().y + 54;
        this.upgradeGroupUI.y = this.unitGroupUI.y + this.unitGroupUI.height + this.structureGroupUI.height + 20;

        for (yy = 0; yy <= 7; yy++) {

            if (index + 1 > this.upgradeCount)
                return;

            this.maxScrollCount++;

            for (xx = 0; xx < 4; xx++) {

                index++;

                if (index > this.upgradeCount)
                    return;

                x = 15 + xx * 62 + (xx * 7);
                y = 16 + yy * 62 + (yy * 7);

                icon = this.game.add.sprite(x - 3, y - 2, 'icon');
                icon.width = 66;
                icon.height = 66;

                this.upgradeGroupUI.add(icon);

                texture = this._getUpgradeTexture(index);

                this._createEntity(x, y, texture, this.upgradeGroupUI);

            }
        }
    },
    
    _createEntity: function(x, y, texture, group) {

        var sprite;

        sprite = this.game.make.button(x, y, this.race, this.unitPressed, this, texture + "-highlight", texture, texture, texture);

        //console.log(sprite.width) //lolol theres still a sprite in terran with 62 width
        group.add(sprite);
    },

    unitPressed: function() {

        console.log(this)
    },

    _getUnitTexture: function(index) {

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

    _getStructureTexture: function(index) {

        var texture;

        if (this.race === 'terran')
            switch (index) {

                case 1:
                texture = 'command-center';
                break;

                case 2:
                texture = 'orbital';
                break;

                case 3:
                texture = 'planetary-fortress';
                break;

                case 4:
                texture = 'refinery';
                break;

                case 5:
                texture = 'supply-depot';
                break;

                case 6:
                texture = 'barracks';
                break;

                case 7:
                texture = 'engineering-bay';
                break;

                case 8:
                texture = 'bunker';
                break;

                case 9:
                texture = 'turret';
                break;

                case 10:
                texture = 'sensor-tower';
                break;

                case 11:
                texture = 'ghost-academy';
                break;

                case 12:
                texture = 'factory';
                break;

                case 13:
                texture = 'armory';
                break;

                case 14:
                texture = 'starport';
                break;

                case 15:
                texture = 'fusion-core';
                break;

                case 16:
                texture = 'tech-lab';
                break;

                case 17:
                texture = 'reactor';
                break;

            }

        else if (this.race === 'protoss')
            switch (index) {

                case 1:
                texture = 'nexus';
                break;

                case 2:
                texture = 'assimilator';
                break;

                case 3:
                texture = 'pylon';
                break;

                case 4:
                texture = 'gateway';
                break;

                case 5:
                texture = 'forge';
                break;

                case 6:
                texture = 'cybernetics-core';
                break;

                case 7:
                texture = 'cannon';
                break;

                case 8:
                texture = 'twilight-council';
                break;

                case 9:
                texture = 'stargate';
                break;

                case 10:
                texture = 'robotics-facility';
                break;

                case 11:
                texture = 'templar-archives';
                break;

                case 12:
                texture = 'fleet-beacon';
                break;

                case 13:
                texture = 'robotics-bay';
                break;

                case 14:
                texture = 'dark-shrine';
                break;
            }

        else if (this.race === 'zerg')
            switch (index) {

                case 1:
                texture = 'hatchery';
                break;

                case 2:
                texture = 'lair';
                break;

                case 3:
                texture = 'hive';
                break;

                case 4:
                texture = 'extractor';
                break;

                case 5:
                texture = 'spawning-pool';
                break;

                case 6:
                texture = 'evolution-chamber';
                break;

                case 7:
                texture = 'roach-warren';
                break;

                case 8:
                texture = 'baneling-nest';
                break;

                case 9:
                texture = 'spine-crawler';
                break;

                case 10:
                texture = 'spore-crawler';
                break;

                case 11:
                texture = 'hydralisk-den';
                break;

                case 12:
                texture = 'lurker-den';
                break;

                case 13:
                texture = 'infestation-pit';
                break;

                case 14:
                texture = 'spire';
                break;

                case 15:
                texture = 'greater-spire';
                break;

                case 16:
                texture = 'nydus-network';
                break;

                case 17:
                texture = 'ultralisk-cavern';
                break;
            }

        return texture;
    },

    _getUpgradeTexture: function(index) {

        var texture;

        if (this.race === 'terran')
            switch (index) {

                case 1:
                texture = 'infantry-weapons-1';
                break;

                case 2:
                texture = 'infantry-weapons-2';
                break;

                case 3:
                texture = 'infantry-weapons-3';
                break;

                case 4:
                texture = 'vehicle-weapons-1';
                break;

                case 5:
                texture = 'vehicle-weapons-2';
                break;

                case 6:
                texture = 'vehicle-weapons-3';
                break;

                case 7:
                texture = 'infantry-armor-1';
                break;

                case 8:
                texture = 'infantry-armor-2';
                break;

                case 9:
                texture = 'infantry-armor-3';
                break;

                case 10:
                texture = 'vehicle-plating-1';
                break;

                case 11:
                texture = 'vehicle-plating-2';
                break;

                case 12:
                texture = 'vehicle-plating-3';
                break;

                case 13:
                texture = 'hisec-auto-tracking';
                break;

                case 14:
                texture = 'cloaking-field';
                break;

                case 15:
                texture = 'stimpack';
                break;

                case 16:
                texture = 'yamato-cannon';
                break;

                case 17:
                texture = 'behemoth-reactor';
                break;

                case 18:
                texture = 'corvid-reactor';
                break;

                case 19:
                texture = 'moebius-reactor';
                break;

                case 20:
                texture = 'drilling-claws';
                break;

                case 21:
                texture = 'building-armor';
                break;

                case 22:
                texture = 'combat-shield';
                break;

                case 23:
                texture = 'durable-materials';
                break;

                case 24:
                texture = 'infernal-preigniter';
                break;

                case 25:
                texture = 'neosteel-frames';
                break;
            }

        else if (this.race === 'protoss')
            switch (index) {

                case 1:
                texture = 'ground-weapons-1';
                break;

                case 2:
                texture = 'ground-weapons-2';
                break;

                case 3:
                texture = 'ground-weapons-3';
                break;

                case 4:
                texture = 'air-weapons-1';
                break;

                case 5:
                texture = 'air-weapons-2';
                break;

                case 6:
                texture = 'air-weapons-3';
                break;

                case 7:
                texture = 'ground-armor-1';
                break;

                case 8:
                texture = 'ground-armor-2';
                break;

                case 9:
                texture = 'ground-armor-3';
                break;

                case 10:
                texture = 'air-armor-1';
                break;

                case 11:
                texture = 'air-armor-2';
                break;

                case 12:
                texture = 'air-armor-3';
                break;

                case 13:
                texture = 'shields-1';
                break;

                case 14:
                texture = 'shields-2';
                break;

                case 15:
                texture = 'shields-3';
                break;

                case 16:
                texture = 'charge';
                break;

                case 17:
                texture = 'gravitic-booster';
                break;

                case 18:
                texture = 'gravitic-drive';
                break;

                case 19:
                texture = 'anion-pulse-crystals';
                break;

                case 20:
                texture = 'extended-thermal-lances';
                break;

                case 21:
                texture = 'psionic-storm';
                break;

                case 22:
                texture = 'blink';
                break;

                case 23:
                texture = 'hallucination';
                break;

                case 24:
                texture = 'graviton-catapult';
                break;
            }

        else if (this.race === 'zerg')
            switch (index) {

                case 1:
                texture = 'melee-attacks-1';
                break;

                case 2:
                texture = 'melee-attacks-2';
                break;

                case 3:
                texture = 'melee-attacks-3';
                break;

                case 4:
                texture = 'missile-attacks-1';
                break;

                case 5:
                texture = 'missile-attacks-2';
                break;

                case 6:
                texture = 'missile-attacks-3';
                break;

                case 7:
                texture = 'flyer-attacks-1';
                break;

                case 8:
                texture = 'flyer-attacks-2';
                break;

                case 9:
                texture = 'flyer-attacks-3';
                break;

                case 10:
                texture = 'ground-carapace-1';
                break;

                case 11:
                texture = 'ground-carapace-2';
                break;

                case 12:
                texture = 'ground-carapace-3';
                break;

                case 13:
                texture = 'flyer-carapace-1';
                break;

                case 14:
                texture = 'flyer-carapace-2';
                break;

                case 15:
                texture = 'flyer-carapace-3';
                break;

                case 16:
                texture = 'chitinous-plating';
                break;

                case 17:
                texture = 'centrifugal-hooks';
                break;

                case 18:
                texture = 'glial-reconstitution';
                break;

                case 19:
                texture = 'metabolic-boost';
                break;

                case 20:
                texture = 'pneumatized-carapace';
                break;

                case 21:
                texture = 'muscular-augments';
                break;

                case 22:
                texture = 'grooved-spines';
                break;

                case 23:
                texture = 'burrow';
                break;

                case 24:
                texture = 'neural-parasite';
                break;

                case 25:
                texture = 'pathogen-glands';
                break;

                case 26:
                texture = 'adrenal-glands';
                break;

                case 27:
                texture = 'tunneling-claws';
                break;

                case 28:
                texture = 'flying-locust';
                break;
            }

        return texture;
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