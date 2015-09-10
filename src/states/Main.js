function Main() {}

// resizing - if width is too small, start to move the building UI off the side and make more room for timeline

// next setup all upgrades, as well as minerals, gas, supply, energy, larva, etc

// have an array of constructing buildings and constructed buildings

// base allowed buildings off constructed buildings array.  Fade out things that cant be made yet

// x = harvesting seconds
// y = travel seconds
// z = waiting seconds (3 SCV saturation)

//Eq.i) Minerals/SCV-second = 5 / (x+y+z)
//Eq.ii) Gas/SCV-second = 4 / (x+y+z)\

/*

The simulation will always spread your workers for optimal mining depending on how many bases you have. 
For one base that means a soft cap at 16 workers and a hard cap at 24 workers. As soon as your expansion 
is finished it will transfer workers but it does not currently take into account the distance between your
 bases as it is impossible for it to know how many you want to transfer. If you want to simulate a probe 
 transfer you will need to do this manually by the sending out worker action and returning with them at 
 a later point.


You cannot explicitly swap addons at this time. The simulation does that for you. For now if you want to 
simulate hovering around with buildings you can do this by adding some pause.

Building in reactories have special actions so that the simulation knows you want to utilize the reactory
 and not two single baracks for example.


 When you are building anything as terran the simulator will temporarily remove one mineral worker.
  So what you want is already simulated.

I see. In that case you need to adjust it by adding pause.

*/

// AUTOMATIC
// so, if (workers > 16 && bases > 2) -> caps workers at this base, transfers extra to next base, and so on with more bases

// MANUAL
// 


// scv mining is   timeForTrip * scvs

// MINERALS: 3.8-4.8sec travel time
// GAS: 3.6-5.0sec travel time


Main.prototype = {

    init: function(race) {

        this.race = race;
    },

    preload: function() {

        this.load.image('minerals', 'assets/minerals.png');

        switch (this.race) {

            case 'terran':
                this.game.load.atlas('terran', 'assets/terran.png', 'assets/terran.json');
                this.load.image('gas', 'assets/terran-gas.png');
                this.load.image('supply', 'assets/depot-supply.png');
                break;

            case 'protoss':
                this.game.load.atlas('protoss', 'assets/protoss.png', 'assets/protoss.json');
                this.load.image('gas', 'assets/protoss-gas.png');
                this.load.image('supply', 'assets/pylon-supply.png');
                break;

            case 'zerg':
                this.game.load.atlas('zerg', 'assets/zerg.png', 'assets/zerg.json');
                this.load.image('gas', 'assets/zerg-gas.png');
                this.load.image('supply', 'assets/overlord-supply.png');
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
        this.workerCount = 12;

        this.timeline = null;
        this.prevTime = 0;

        this.maxScrollCount = 0;
        this.isScrolling = false;
        this.scrollDifference = 0;
        this.maxHeight = 0;
        this.timeIterations = 0;
        this.visibleTimeIterations = 0;
        this.timeLandmarks = 0;
        this.slowdownDrag = 0;

        this.bg = null;

        this.bg = this.game.add.image(0, 0, 'stars')
        this.bg.alpha = 0.2;

        this.unitGroupUI = this.game.add.group();
        this.structureGroupUI = this.game.add.group();
        this.upgradeGroupUI = this.game.add.group();
        this.lineGroupUI = this.game.add.group();
        this.lineGroup = this.game.add.group();
        this.workerGroup = this.game.add.group();
        this.baseGroup = this.game.add.group();

        this.initUI();

        this.initRace();

        this.createUnits();

        this.createStructures();

        this.createUpgrades();

        this.startUI();

        this.initTimeline();

        this.initBases();

        this.initWorkers();

        // Next: boxes for constructing, use filled rectangles

        this.timer = _game.time.create(true);

        for (var i = 0; i < 24; i++) {

            //var test = this.game.add.bitmapText(60, 0 + (i * 30), 'Agency_35', '1000', 35);
            //test.visible = false;
            //test.exists = false;
        }
    },

    update: function() {

        if (this.isScrolling) {

            var scrollValue;
            var val;
            var scrollVal;
            var _upgradeY;
            var structureY;
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

            // Starting scroll point
            if (scrollValue >= _scrollingBar.height)
                scrollValue = _scrollingBar.height;
            else
                scrollValue = (_game.input.activePointer.y - _scrollingBar.y);

            // follow input with scroll bar
            scrollVal = _game.input.activePointer.y - this.scrollDifference;
            _scrollingBar.y = scrollVal;

            // scroll bar at top
            if (_scrollingBar.y < 0)
                _scrollingBar.y = 0;

            // scroll bar at bottom
            else if (_scrollingBar.y > (_game.height - _scrollingBar.height))
                _scrollingBar.y = (_game.height - _scrollingBar.height);

            // Get the percentage Y value to adjust the unit group by relevant to scroll bar
            val = this.heightDifferece * (_scrollingBar.y / this.gameAndScrollHeight) - 10;

            _unitGroupUI.y = -val;

            structureY = _unitGroupUI.y + _unitGroupUI.height + 10;
            upgradeY = _unitGroupUI.y + _unitGroupUI.height + this.structureGroupUI.height + 20;

            _structureGroupUI.y = structureY;
            _upgradeGroupUI.y = upgradeY;

            // Cropping icons
            _structureGroupUI.forEach(this._crop, this);
            _upgradeGroupUI.forEach(this._crop, this);
        }
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

        var i;
        var timeValue;
        var timeString1;
        var timeString2;
        var timeString;
        var time;
        var line;
        var line2;
        var supplyIcon;
        var gasIcon;
        var mineralIcon;
        var line;
        var line2;
        var line3;
        var line4;
        var _game;
        var _lineGroup;
        var _lineGroupUI;
        var __gameWidth;
        var __gameHeight;

        _game = this.game;
        _lineGroup = this.lineGroup;
        _lineGroupUI = this.lineGroupUI;

        __gameWidth = _game.width;
        __gameHeight = _game.height;


        // Scroll bar
        this.scrollingBar = _game.add.sprite(0, 0, 'scrolling-bar');

        this.scrollBar = _game.add.button(__gameWidth - 42, 0, '', this._scrollBar, this);
        this.scrollBar.width = 42;
        this.scrollBar.height = __gameHeight;
        this.scrollBar.onInputDown.add(this._scrollBar, this);


        // Selection UI
        line = _game.make.graphics(__gameWidth - 330, 51);
        line.lineStyle(3, 0x00ff00, 1);
        line.lineTo(10, 10);
        line.lineTo(10, __gameHeight - 53);
        line.lineTo(328, __gameHeight - 53);
        line.lineTo(328, -90);
        line.lineTo(296, -90);
        line.lineTo(296, __gameHeight);


        // 2nd down from top
        line2 = _game.make.graphics(__gameWidth - 330, 51);
        line2.lineStyle(3, 0x00ff00, 1);
        line2.lineTo(-1000, 0);


        // top of screen
        line3 = _game.make.graphics(0, 1);
        line3.lineStyle(3, 0x00ff00, 1);
        line3.lineTo(__gameWidth, 0);


        // small left end of screen
        line4 = _game.make.graphics(1, 1);
        line4.lineStyle(3, 0x00ff00, 1);
        line4.lineTo(0, 51);


        // Line under times
        line5 = _game.make.graphics(0, 81);
        line5.lineStyle(3, 0x00ff00, 1);
        line5.lineTo(__gameWidth - 323, 0);


        // Add all UI lines to group
        _lineGroupUI.add(line);
        _lineGroupUI.add(line2);
        _lineGroupUI.add(line3);
        _lineGroupUI.add(line4);
        _lineGroupUI.add(line5);


        // Mineral / gas / supply icons
        mineralIcon = _game.add.sprite(85, 6, 'minerals');
        mineralIcon.width = 42;
        mineralIcon.height = 42;

        this.mineralText = _game.add.bitmapText(135, 10, 'Agency_35', '0', 35);
        this.mineralText.tint = 0x00ff00;

        gasIcon = _game.add.sprite(240, 6, 'gas');
        gasIcon.width = 42;
        gasIcon.height = 42;

        this.gasText = _game.add.bitmapText(290, 10, 'Agency_35', '0', 35);
        this.gasText.tint = 0x00ff00;

        supplyIcon = _game.add.sprite(370, 6, 'supply');
        supplyIcon.width = 42;
        supplyIcon.height = 42;

        this.supplyText = _game.add.bitmapText(420, 10, 'Agency_35', '12/15', 35);
        this.supplyText.tint = 0x00ff00;


        if (_game.device.desktop) {

            // Desktop
            this.timeIterations = 25;
            this.visibleTimeIterations = Math.floor((__gameWidth - 232) / 90) - 2;
        } else {

            // Mobile
            this.timeIterations = Math.floor((__gameWidth - 232) / 90) - 1;
        }


        // Time texts
        for (i = 0; i < this.timeIterations; i++) {

            //For mobile, maybe make this one big bitmapdata

            timeValue = (i) * 30;

            timeString1 = Math.floor(timeValue / 60).toString();
            timeString2 = this.pad((timeValue % 60), 2);

            timeString = (timeString1 + ":" + timeString2);

            time = _game.make.bitmapText(5 + (i * 90), 58, 'Agency_35', timeString, 25);
            time.index = i;
            time.seconds = timeValue;
            line = _game.make.graphics((i * 90), 80);
            line.lineStyle(3, 0x00ff00, 1);
            line.lineTo(0, -8);

            line2 = _game.make.graphics((i * 90), 80);
            line2.lineStyle(1, 0x00ff00, 0.2);
            line2.lineTo(0, this.game.height - 50);
            _lineGroup.add(time);
            _lineGroup.add(line);
            _lineGroup.add(line2);

            if (i > this.visibleTimeIterations) {

                time.visible = false;
                line.visible = false;
                line2.visible = false;

            }
        }

        // Current time
        this.currentTimeText = _game.add.bitmapText(10, 10, 'Agency_35', '0:00', 35);


        // Do a scale update
        this.scaleUpdate();
    },

    startUI: function() {

        var maxHeightVar;
        var heightDiffereceVar;
        var scrollingBarHeightVar;
        var gameAndScrollHeightVar;
        var structureY;
        var upgradeY;
        var _game;
        var _unitGroupUI;
        var __gameHeight;
        var __gameWidth;

        _game = this.game;
        _unitGroupUI = this.unitGroupUI;
        __gameHeight = _game.height;
        __gameWidth = _game.width;


        // Set state-wide size variables
        maxHeightVar = this.unitGroupUI.height + this.structureGroupUI.height + this.upgradeGroupUI.height + 20;
        this.maxHeight = maxHeightVar;

        heightDiffereceVar = (this.maxHeight - __gameHeight + 20);
        this.heightDifferece = heightDiffereceVar;

        scrollingBarHeightVar = __gameHeight * ((this.maxHeight - __gameHeight) / this.maxHeight);
        this.scrollingBar.height = scrollingBarHeightVar;

        gameAndScrollHeightVar = (__gameHeight - this.scrollingBar.height);
        this.gameAndScrollHeight = gameAndScrollHeightVar;


        // Cropping icons
        this.structureGroupUI.forEach(this._crop, this);
        this.upgradeGroupUI.forEach(this._crop, this);


        _game.world.sendToBack(this.scrollingBar);

        this.scaleUpdate();
    },

    initTimeline: function() {

        var line;
        var line2;

        // Gray timeline line bar container
        this.timelineDrag = this.game.add.sprite(1, 83, '');
        this.timelineDrag.width = 35;
        this.timelineDrag.height = this.game.height - 83;
        this.timelineDrag.inputEnabled = true;
        this.timelineDrag.input.enableDrag();
        this.timelineDrag.input.allowVerticalDrag = false;

        // Gray line
        this.timeline = this.game.add.graphics(1, 83);
        this.timeline.lineStyle(2, 0x666666, 1);
        this.timeline.lineTo(0, (this.game.height - 83))

        // Timeline events
        this.timelineDrag.events.onDragStart.add(this.moveTimeline, this);
        this.timelineDrag.events.onDragUpdate.add(this.updateTimeline, this);
    },

    moveTimeline: function(line) {
    },

    updateTimeline: function(line) {

        var i;
        var x;
        var seconds;
        var minutes;
        var realTime;
        var _game;
        var _lineGroup;
        var __gameWidth;

        _game = this.game;
        _lineGroup = this.lineGroup;
        __gameWidth = _game.width;

        // X value of the line sprite dragged by mouse
        x = Math.floor(line.x + (line.width / 2) - 0.5);

        timeValue = (-(_lineGroup.x / 3) + (this.timeLandmarks * 30)) + (this.timeline.x / 3);
        minutes = Math.floor(timeValue / 60).toString();
        seconds = this.pad((timeValue % 60), 2);
        realTime = (minutes + ":" + seconds);

        // If timeline is moved within movable area
        if (this.timelineDrag.x < __gameWidth - 349) {

            // Get time string
            
            /*
            seconds = Math.floor((1 - ((90 - x) / 90)) * 30);
            minutes = Math.floor(seconds / 60);
            realTime = (minutes + ":" + this.pad(seconds % 60, 2));
            realTime.toString();
            */
            
            
            
    
            console.log(realTime);

            // Only move the timeline bar per second
            //if (this.prevTime != seconds) 
                this.timeline.x = Math.floor((1 - ((90 - x) / 90)) * 30) * 3; //seconds * 3; //(timeline.x % / 3)

            this.currentTimeText.setText(realTime);


        // If timeline is dragged to maximum right, start scrolling
        } else {

            // Wait for 3 updates (matching a second) before sliding the time/line group over
            if (this.slowdownDrag < 3) {

                this.slowdownDrag++;
                return;
            }

            // Reset slow drag count
            this.slowdownDrag = 0;

            // Set gray timeline bar position
            this.timelineDrag.x = __gameWidth - 350;

            // Move time/line group
            _lineGroup.x -= 3;


            this.currentTimeText.setText(realTime);


            // If scrolled past the width of a 30 second time block, reset lineGroup position and change times to align
            if (_lineGroup.x <= -90) {

                _lineGroup.x = 0;
             
                this.timeLandmarks++;

               // Time texts
               for (i = 0; i < this.timeIterations; i++) {

                   //For mobile, maybe make this one big bitmapdata

                   timeValue = (i + this.timeLandmarks) * 30;
                   minutes = Math.floor(timeValue / 60).toString();
                   seconds = this.pad((timeValue % 60), 2);
                   realTime = (minutes + ":" + seconds);


                   time = _lineGroup.getAt((i * 3));

                   time.text = realTime;

                   /*
                   if ((i / 3) > this.visibleTimeIterations) {

                       time.visible = false;
                       line.visible = false;
                       line2.visible = false;

                   }
                   */
               }

            }
        }

        this.prevTime = seconds;
    },

    _changeTime: function(sprite) {

        var val;

        if (sprite.type === 6) {

            val = sprite.seconds;

        }

    },


    initBases: function() {

        // 8 patches per base.
    },

    initWorkers: function() {

        // Per base.  
    },

    _crop: function(sprite) {

        if ((sprite.y + sprite.parent.y) > this.game.height) {

            sprite.visible = false;
        } else if (!sprite.visible) {

            sprite.visible = true;
        }
    },

    scaleUpdate: function() {

        var i;
        var uiPos;
        var _game;
        var _lineGroup;
        var _lineGroupUI;
        var __gameWidth;
        var val;

        _game = this.game;
        _lineGroup = this.lineGroup;
        _lineGroupUI = this.lineGroupUI;

        __gameWidth = _game.width;

        uiPos = __gameWidth - 310;

        this.unitGroupUI.x = uiPos;
        this.structureGroupUI.x = uiPos;
        this.upgradeGroupUI.x = uiPos;

        this.scrollBar.x = __gameWidth - 32;
        this.scrollingBar.x = __gameWidth - 32;

        _lineGroupUI.getAt(0).x = __gameWidth - 330;
        _lineGroupUI.getAt(1).x = __gameWidth - 329;
        _lineGroupUI.getAt(1).width = __gameWidth - 320;
        _lineGroupUI.getAt(2).width = __gameWidth + 10;
        _lineGroupUI.getAt(4).moveTo(0, 0);
        _lineGroupUI.getAt(4).lineTo(__gameWidth - 323, 0);
        _lineGroupUI.getAt(4).width = __gameWidth - 315;


        // Strech background to fit the screen
        if (_game.device.desktop && this.bg !== null && __gameWidth > 960)
            this.bg.width = __gameWidth;
        else if (this.bg !== null)
            this.bg.width = 960;

        // Control visibility of time indicators based on width
        if (_game.device.desktop) {

            for (i = 0; i < 75; i += 3) {

                val = ((90 + (i / 3 * 90)));

                // Time incrament visibility
                if ((__gameWidth - 270) >= val) 
                    _lineGroup.getAt(i).visible = true;
                 else 
                    _lineGroup.getAt(i).visible = false;


                // Time line visibility (lasts longer than time incrament)
                if ((__gameWidth - 232) >= val) {

                    _lineGroup.getAt((i + 1)).visible = true;
                    _lineGroup.getAt((i + 2)).visible = true;

                } else {

                    _lineGroup.getAt((i + 1)).visible = false;
                    _lineGroup.getAt((i + 2)).visible = false;

                }
            }
        }
    },

    _scrollBar: function() {

        var scrollValue;

        this.isScrolling = !(this.isScrolling);

        if (!this.isScrolling) {

            this.scrollingBar.anchor.setTo(0, 0);
            return;
        }

        scrollValue = (this.game.input.activePointer.y - this.scrollingBar.y);

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
        var _game;
        var __gameWidth;

        _game = this.game;

        __gameWidth = this.game.width;

        index = 0;

        this.unitGroupUI.x = __gameWidth - 310;
        this.unitGroupUI.y = 10;

        for (yy = 0; yy <= 7; yy++) {

            if (index + 1 > this.unitCount)
                return;

            this.maxScrollCount++;

            for (xx = 0; xx < 4; xx++) {

                index++;

                if (index > this.unitCount)
                    return;

                x = xx * 62 + (xx * 7);
                y = yy * 62 + (yy * 7);

                //icon = this.game.add.sprite(x - 3, y - 2, 'icon');
                //icon.width = 66;
                //icon.height = 66;
                //icon.tint = 0xff0000;

                //this.unitGroupUI.add(icon);

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

        this.structureGroupUI.y = this.unitGroupUI.y + this.unitGroupUI.height + 10;


        for (yy = 0; yy <= 7; yy++) {

            if (index + 1 > this.structureCount)
                return;

            this.maxScrollCount++;

            for (xx = 0; xx < 4; xx++) {

                index++;

                if (index > this.structureCount)
                    return;

                x = xx * 62 + (xx * 7);
                y = yy * 62 + (yy * 7);

                //icon = this.game.add.sprite(x - 3, y - 2, 'icon');
                //icon.width = 66;
                //icon.height = 66;
                //icon.tint = 0xff0000;

                //this.structureGroupUI.add(icon);

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
        var _game;

        index = 0;

        this.upgradeGroupUI.y = this.unitGroupUI.y + this.unitGroupUI.height + this.structureGroupUI.height + 20;

        for (yy = 0; yy <= 7; yy++) {

            if (index + 1 > this.upgradeCount)
                return;

            this.maxScrollCount++;

            for (xx = 0; xx < 4; xx++) {

                index++;

                if (index > this.upgradeCount)
                    return;

                x = xx * 62 + (xx * 7);
                y = yy * 62 + (yy * 7);

                //icon = this.game.add.sprite(x - 3, y - 2, 'icon');
                //icon.width = 66;
                //icon.height = 66;

                //this.upgradeGroupUI.add(icon);

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
            } else if (this.race === 'protoss')
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
                } else if (this.race === 'zerg')
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

            } else if (this.race === 'protoss')
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
                } else if (this.race === 'zerg')
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
            } else if (this.race === 'protoss')
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
                } else if (this.race === 'zerg')
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
    },

    pad: function(str, max) {

        str = str.toString();
        return str.length < max ? this.pad("0" + str, max) : str;
    }
};

module.exports = Main;