function Main() {}

//grunt custom --exclude gamepad,retrofont,net,debug,arcade,ninja,p2,creature,video --sourcemap true --uglify

////Math.floor((1 - ((90 - x) / 90)) * 30) * 3;

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

4a) Closest mineral patch, SCVs vs income
- 1 SCV: Measured 45min/minute (predicted 45min/m)
- 2 SCVs: Measured 90min/minute (predicted 90min/m)
- 3 SCVs: Measured 100-105min/minute (predicted 102min/m)

4b) Furthest mineral patch, SCVs vs income
- 1 SCV: Measured 35-40 min/minute (predicted 39min/m)
- 2 SCVs: Measured 75-80min/minute (predicted 78min/m)
- 3 SCVs: Measured 100-105min/minute (predicted 102min/m)


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



// next: timeline reset fix

// IT IS TIME!!!!!!!!!!!!!!!!!!!

// ***** REMOVED ALL GRAPHIC LINES BESIDES TIMELINE

// next: keep the timeline text as bitmapcached, but make it much longer and reset less often
//       also, use Line instead of Graphic

Main.prototype = {

    init: function(race) {

        this.race = race;
    },

    preload: function() {

        this.load.image('minerals', 'assets/minerals.png');
        this.load.image('energy', 'assets/energy.png');
        this.load.image('icon', 'assets/icon.png');
        this.load.image('stars', 'assets/stars.png');
        this.load.image('stars-cover', 'assets/stars-cover.png');


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
                this.load.image('larva', 'assets/larva.png');
                break;

        }
    },

    create: function() {

        var _game;

        _game = this.game;

        _game.scale.onSizeChange.add(this.scaleUpdate, this);
        _game.input.justReleasedRate = 10;

        _game.input.holdRate = 150;
        _game.input.onHold.add(this._buildOrderScrollingBar, this)
        _game.input.onUp.add(this._inputUp, this);

        // Assign state variables
        this.buildHash = window.location.hash;
        this.unitCount = 0;
        this.structureCount = 0;
        this.workerCount = 12;
        
        this.uiColor = 0x87CEFF;

        this.scrollBar = null;
        this.scrollingBar = null;
        this.gameAndScrollHeight = 0;
        this.gameAndBuildOrderWidth = 0;
        this.buildOrderScrollBar = null;
        this.buildOrderScrollingBar = null;
        this.timeline = null;
        this.timelineMoveDelay = 0;
        this.maxScrollCount = 0;
        this.isScrolling = false;
        this.timelineScrolling = false;
        this.scrollDifference = 0;
        this.buildOrderScrollDifference = 0;
        this.heightDifference = 0;
        this.widthDifference = 0;
        this.maxHeight = 0;
        this.timeIterations = 0;
        this.timeLandmarks = 0;
        this.slowdownDrag = 0;
        this.greenLineIndex = 0;

        this.mineralIcon = null;
        this.mineralText = null;
        this.gasIcon = null;
        this.gasText = null;
        this.supplyIcon = null;
        this.supplyText = null;

        this.allowRemove = true;
        this.scrollBuildOrder = false;

        this.supply = 0;

        if (this.race === 'zerg') {
            this.larvaIcon = null;
            this.larvaText = null;
        }

        //this.bg = null;

        //this.bg = this.game.add.image(0, 0, 'stars')
        //this.bg.alpha = 0.2;

        this.timelineGroup = this.game.add.group();
        this.starsCover = this.game.add.image(this.game.width - 334, 114, 'stars-cover');
        this.unitGroupUI = this.game.add.group();
        this.structureGroupUI = this.game.add.group();
        this.upgradeGroupUI = this.game.add.group();
        this.starsCoverTop = this.game.add.image(this.game.width - 354, 0, 'stars-cover');
        this.starsCoverTop.width = 354;
        this.starsCoverTop.height = 68;
        this.buildOrderGroup = this.game.add.group();
        this.buildOrderGroup.x = 3;
        this.buildOrderGroup.y = 1;
        this.buildOrderGroup.inputEnabled = true;
        this.lineGroupUI = this.game.add.group();
        this.workerGroup = this.game.add.group();
        this.baseGroup = this.game.add.group();

        this.timelineGroup.tween = this.game.add.tween(this.timelineGroup).to({
            x: -90
        }, 1000, Phaser.Easing.Quadratic.Out, false);
        //tween.onComplete.addOnce(tween2, this);

        this.initTimeline();

        this.initUI();

        this.initRace();

        this.createUnits();

        this.createStructures();

        this.createUpgrades();

        this.startUI();

        this.initBases();

        this.initWorkers();

        //this.unitGroupUI.cacheAsBitmap = true;
        //this.structureGroupUI.cacheAsBitmap = true;
        //this.upgradeGroupUI.cacheAsBitmap = true;

        // Next: boxes for constructing, use filled rectangles

        this.timer = _game.time.create(true);
    },

    _inputUp: function() {

        this.scrollBuildOrder = false;

        this.game.time.events.add(10, this.__allowRemove, this)
    },

    __allowRemove: function() {

        this.allowRemove = true;
    },

    update: function() {

        // Scrolling timeline bar
        if (this.timelineScrolling) {
       
            var i;
            var x;
            var seconds;
            var minutes;
            var realTime;
            var _game;
            var _timeIterations;
            var _timelineGroup;
            var _endOfTimeline;
            var _timeline;
            var _timelineDrag;
            var _timeLandmarks;
            var _timeValue;
            var __gameWidth;


            _game = this.game;
            _timeIterations = this.timeIterations;
            _timelineGroup = this.timelineGroup;
            _endOfTimeline = this.endOfTimeline;
            _timeline = this.timeline;
            _timelineDrag = this.timelineDrag;
            _timeLandmarks = this.timeLandmarks;
            __gameWidth = _game.width;

            
            // Move timeline bar to maximum right distance
            if (_timelineDrag.x > __gameWidth - 390 - (__gameWidth % 3)) 
                _timeline.x = __gameWidth - 366 - (__gameWidth % 3);
            // Move timeline bar to active dragging position
            else if (_timeline.x >= 0)
                _timeline.x = _timelineDrag.x + 24;
            // Limit timeline bar below 0 afterward
            if (_timeline.x < 0)
                _timeline.x = 0;

            // Get time string
            this.timeValue = (-(_timelineGroup.x / 3) + (_timeLandmarks * 30)) + ((_timeline.x) / 3);
            _timeValue = this.timeValue;
            minutes = Math.floor(_timeValue / 60).toString();
            seconds = this.pad((_timeValue % 60), 2);
            realTime = (minutes + ":" + seconds);


            // Set the time according to timeline location
            this.currentTimeText.setText(realTime);


            // -----If timeline is dragged to maximum left, start scrolling backwards
            if (_timelineDrag.x <= 20 && this.timeLandmarks != -4) {


                // Move time/line group
                _timelineGroup.x += 3;


                // If scrolled past the width of a 30 second time block, reset lineGroup position and change times to align
                if (_timelineGroup.x >= 0) {

                    _timelineGroup.x = -360;

                    this.timeLandmarks -= 4;
                    _timeLandmarks = this.timeLandmarks;


                    // Update time texts
                    for (i = 0; i < _timeIterations * 3; i++) {

                        _timeValue = (i + _timeLandmarks - 1) * 30;
                        minutes = Math.floor(_timeValue / 60).toString();
                        seconds = this.pad((_timeValue % 60), 2);
                        realTime = (minutes + ":" + seconds);

                        time = _timelineGroup.getAt((i * 3));

                        time.text = realTime;
                    }
                }


                // Control visibility of passing timeline indicators
                _timelineGroup.forEach(this._updateTimelineVisibility, this, false, _timelineGroup, this.endOfTimeline);

             
                // -----If timeline dragged maximum right, start scrolling
            } else if (_timelineDrag.x > __gameWidth - 390) {
            

                // Adjust the speed the timelineGroup will move at based on distance of cursor
                if (_timelineDrag.x > __gameWidth - 390 && _timelineDrag.x <= __gameWidth - 380)
                    this.timelineMoveDelay += 2;
                else if (_timelineDrag.x > __gameWidth - 380 && _timelineDrag.x <= __gameWidth - 370)
                    this.timelineMoveDelay += 5;
                else if (_timelineDrag.x > __gameWidth - 370)
                    this.timelineMoveDelay += 10;


                // Only move timeline when delay cap is reached
                if (this.timelineMoveDelay >= 10) {

                    _timelineGroup.x -= 3;
                    this.timelineMoveDelay = 0;
                }


                // If scrolled past the width of a 30 second time block, reset lineGroup position and change times to align
                if (_timelineGroup.x <= -360) {

                    _timelineGroup.x = 0;

                    this.timeLandmarks += 4;
                    _timeLandmarks = this.timeLandmarks;


                    // Update time texts
                    for (i = 0; i < _timeIterations * 3; i++) {

                        _timeValue = (i + _timeLandmarks - 1) * 30;
                        minutes = Math.floor(_timeValue / 60).toString();
                        seconds = this.pad((_timeValue % 60), 2);
                        realTime = (minutes + ":" + seconds);

                        time = _timelineGroup.getAt((i * 3));

                        time.text = realTime;
                    }
                }


                // Control visibility of passing timeline indicators
                _timelineGroup.forEach(this._updateTimelineVisibility, this, false, _timelineGroup, this.endOfTimeline);
            }



            this.updateResources();
        }

        // Scrolling top build order bar
        if (this.scrollBuildOrder) {

            var val;
            var scrollVal;
            var scrollHeight;
            var maxWidthVar;
            var _game;
            var _buildOrderGroup;
            var _buildOrderScrollingBar;
            var __gameWidth;


            _game = this.game;
            _buildOrderGroup = this.buildOrderGroup;
            _buildOrderScrollingBar = this.buildOrderScrollingBar;
            __gameWidth = _game.width;


            this.allowRemove = false;


            // The full width of the build order and build order scroll bar (newWidth)
            maxWidthVar = ((_buildOrderGroup.length / 2) * 65);
            newWidth = __gameWidth - (__gameWidth * ((maxWidthVar - __gameWidth) / maxWidthVar));
            if (newWidth > __gameWidth)
                newWidth = __gameWidth;

            _buildOrderGroup.forEach(this._checkBounds, this, false, __gameWidth);

            // Scroll the build order 
            scrollVal = _game.input.activePointer.x - this.buildOrderScrollDifference;


            // Keep build order scroll bar within bounds.  
            if (scrollVal < 0) {

                _buildOrderScrollingBar.x = 0;
            }

            // Off right side of screen, auto-adjust
            else if (scrollVal + newWidth >= __gameWidth) {

                _buildOrderScrollingBar.x = __gameWidth - newWidth;
            }

            // In scrollable area of screen, actively adjust
            else {

                _buildOrderScrollingBar.x = scrollVal;
            }

            val = this.widthDifference * (_buildOrderScrollingBar.x / this.gameAndBuildOrderWidth);
            this.buildOrderGroup.x = -val + 3;
        }

        // Scrolling side UI
        if (this.isScrolling) {

            var val;
            var scrollVal;
            var _upgradeY;
            var _scrollingBar;
            var _game;
            var _unitGroupUI;
            var _structureGroupUI;
            var _upgradeGroupUI;
            var _heightDifference;
            var _gameAndScrollHeight;


            _scrollingBar = this.scrollingBar;
            _game = this.game;
            _unitGroupUI = this.unitGroupUI;
            _structureGroupUI = this.structureGroupUI;
            _upgradeGroupUI = this.upgradeGroupUI;
            _heightDifference = this.heightDifferece;
            _gameAndScrollHeight = this.gameAndScrollHeight;


            // follow input with scroll bar
            scrollVal = (_game.input.activePointer.y - this.scrollDifference) >> 0;
            _scrollingBar.y = scrollVal;


            // scroll bar at top
            if (_scrollingBar.y < 67)
                _scrollingBar.y = 67;


            // scroll bar at bottom
            else if (_scrollingBar.y > (_game.height - _scrollingBar.height))
                _scrollingBar.y = (_game.height - _scrollingBar.height);


            // Get the percentage Y value to adjust the unit group by relevant to scroll bar
            val = (_heightDifference * ((_scrollingBar.y - 67) / _gameAndScrollHeight) - 10) - 74 >> 0;


            _unitGroupUI.y = -val;
            structureY = _unitGroupUI.y + _unitGroupUI.height + 10;
            upgradeY = _unitGroupUI.y + _unitGroupUI.height + _structureGroupUI.height + 20;


            _structureGroupUI.y = structureY;
            _upgradeGroupUI.y = upgradeY;


            // Cropping icons
            //_structureGroupUI.forEach(this._crop, this);
            //_upgradeGroupUI.forEach(this._crop, this);
        }
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
        var line;
        var line2;
        var line3;
        var line4;
        var _game;
        var _timelineGroup;
        var _lineGroupUI;
        var _timeValue;
        var _uiColor;
        var __gameWidth;
        var __gameHeight;

        _game = this.game;
        _timelineGroup = this.timelineGroup;
        _lineGroupUI = this.lineGroupUI;
        _timeValue = this.timeValue;
        _uiColor = this.uiColor;

        __gameWidth = _game.width;
        __gameHeight = _game.height;

        // Static scroll bar button
        this.scrollBar = _game.add.button(__gameWidth - 42, 67, '', this._scrollBar, this);
        this.scrollBar.width = 42;
        this.scrollBar.height = __gameHeight - 67;
        this.scrollBar.onInputDown.add(this._scrollBar, this);
        
        // Selection UI
        line = _game.make.graphics(__gameWidth - 330, 115);
        line.lineStyle(3, _uiColor, 1);
        line.lineTo(10, 10);
        line.lineTo(10, __gameHeight - 117);
        line.lineTo(328, __gameHeight - 117);
        line.lineTo(328, -48);
        line.lineStyle(3, _uiColor, 0.2);
        line.moveTo(296, -48);
        line.lineStyle(3, _uiColor, 1);
        line.lineTo(296, __gameHeight - 64);


        // 2nd down from top
        line2 = _game.make.graphics(__gameWidth - 329, 115);
        line2.lineStyle(3, _uiColor, 1);
        line2.lineTo(-__gameWidth + 323, 0);


        // top of screen
        line3 = _game.make.graphics(0, 65);
        line3.lineStyle(3, _uiColor, 0.2);
        line3.lineTo(__gameWidth, 0);


        // small left end of screen
        line4 = _game.make.graphics(1, 65);
        line4.lineStyle(3, _uiColor, 1);
        line4.lineTo(0, 51);


        // Line under times
        line5 = _game.make.graphics(0, 145);
        line5.lineStyle(3, _uiColor, 1);
        line5.lineTo(__gameWidth - 320, 0);
        


        // Add all UI lines to group
        _lineGroupUI.add(line);
        _lineGroupUI.add(line2);
        _lineGroupUI.add(line3);
        _lineGroupUI.add(line4);
        _lineGroupUI.add(line5);


        // Compress graphics into UI wireframe texture for mobile
        if (!_game.device.desktop) {
            _lineGroupUI.cacheAsBitmap = true;
            line.destroy();
            line2.destroy();
            line3.destroy();
            line4.destroy();
            line5.destroy();
        }
        
        // Mineral / gas / supply icons
        this.mineralIcon = _game.add.sprite(__gameWidth - 800, 71, 'minerals');
        this.mineralIcon.width = 40;
        this.mineralIcon.height = 40;

        this.mineralText = _game.add.bitmapText(__gameWidth - 750, 74, 'Agency_35', '0', 35);
        this.mineralText.tint = _uiColor;

        this.gasIcon = _game.add.sprite(__gameWidth - 650, 71, 'gas');
        this.gasIcon.width = 40;
        this.gasIcon.height = 40;

        this.gasText = _game.add.bitmapText(__gameWidth - 600, 74, 'Agency_35', '0', 35);
        this.gasText.tint = _uiColor;

        this.supplyIcon = _game.add.sprite(__gameWidth - 500, 70, 'supply');
        this.supplyIcon.width = 42;
        this.supplyIcon.height = 42;

        this.supplyText = _game.add.bitmapText(__gameWidth - 450, 74, 'Agency_35', '12/15', 35);

        this.energyIcon = _game.add.sprite(__gameWidth - 375, 70, 'energy');
        this.energyIcon.width = 42;
        this.energyIcon.height = 42;

        this.energyText = _game.add.bitmapText(__gameWidth - 325, 74, 'Agency_35', '0', 35);

        if (this.race === 'zerg') {

            this.larvaIcon = _game.add.sprite(__gameWidth - 375, 70, 'larva');
            this.larvaIcon.width = 42;
            this.larvaIcon.height = 42;

            this.larvaText = _game.add.bitmapText(__gameWidth - 325, 74, 'Agency_35', '0', 35);
        }


        if (_game.device.desktop) {

            // Desktop
            this.timeIterations = 25; //Math.floor((__gameWidth - 232) / 90) + 1;
        } else {

            // Mobile
            this.timeIterations = Math.floor((__gameWidth - 232) / 90) + 1;
        }


        // Time texts
        for (i = 0; i < this.timeIterations; i++) {

            _timeValue = (i - 1) * 30;

            var timeString1 = Math.floor(_timeValue / 60).toString();
            var timeString2 = this.pad((_timeValue % 60), 2);
            var timeString = (timeString1 + ":" + timeString2);
            var time = _game.add.bitmapText(-85 + (i * 90), 122, 'Agency_35', timeString, 25);

            time.tint = _uiColor;
            time.index = i;
            time.seconds = _timeValue;

            line = _game.make.image(-90 + (i * 90), 136, 'ui-white-square');
            line.width = 3;
            line.height = 8;

            line2 = _game.make.image(-90 + (i * 90), 144, 'ui-white-square');
            line2.width = 1;
            line2.height = this.game.height - 50;

            time.tint = 0x87CEFF;
            line.tint = 0x87CEFF;
            line2.tint = 0x87CEFF;


            _timelineGroup.add(time);
            _timelineGroup.add(line);
            _timelineGroup.add(line2);


            if (i - 1 >= (Math.floor((__gameWidth - 232) / 90))) {
                time.visible = false;
                line.visible = false;
                line2.visible = false;
            }
        }

        // Current time
        this.currentTimeText = _game.add.bitmapText(10, 74, 'Agency_35', '0:00', 35);


        //Build order scroll bar
        this.buildOrderScrollingBar = _game.add.image(0, 65, 'ui-white-square');
        this.buildOrderScrollingBar.width = __gameWidth;
        this.buildOrderScrollingBar.height = 3;
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
        __gameHeight = _game.height - 67;
        __gameWidth = _game.width;


        // Set state-wide size variables
        maxHeightVar = this.unitGroupUI.height + this.structureGroupUI.height + this.upgradeGroupUI.height + 20;
        this.maxHeight = maxHeightVar;

        heightDiffereceVar = (this.maxHeight - __gameHeight + 30);
        this.heightDifferece = heightDiffereceVar;

        scrollingBarHeightVar = __gameHeight * ((this.maxHeight - __gameHeight) / this.maxHeight);


        // Create scrolling bar.  Needed to be created here.
        this.scrollingBar = _game.add.image(0, 67, 'ui-white-square');
        this.scrollingBar.width = 28;
        this.scrollingBar.height = scrollingBarHeightVar;
        this.scrollingBar.tint = this.uiColor;


        // Used in update to properly adjust unit groups based on game height
        gameAndScrollHeightVar = (__gameHeight - this.scrollingBar.height);
        this.gameAndScrollHeight = gameAndScrollHeightVar;


        // Cropping icons
        //this.structureGroupUI.forEach(this._crop, this);
        //this.upgradeGroupUI.forEach(this._crop, this);


        this.scaleUpdate();
    },

    initTimeline: function() {

        var line;
        var line2;

        //this.game.world.setBounds(0, 0, 100, 640); // ** Maybe adjust this for camera zooming

        // Gray timeline line bar container
        this.timelineDrag = this.game.add.image(-24, 147, 'ui-blue-timeline-bar');
        this.timelineDrag.alpha = 0.2;
        this.timelineDrag.width = 51;
        this.timelineDrag.height = this.game.height - 147;
        this.timelineDrag.inputEnabled = true;
        this.timelineDrag.input.enableDrag();
        this.timelineDrag.input.enableSnap(3, 1, true, false);
        this.timelineDrag.input.allowVerticalDrag = false;
        //this.timelineDrag.alpha = 0;

        // Gray line
        this.timeline = this.game.add.image(0, 147, 'ui-blue-timeline-bar');//this.game.add.graphics(0, 147);
        this.timeline.width = 3;
        this.timeline.height = this.game.height - 147;
        //this.timeline.lineStyle(2, 0x666666, 1);
        //this.timeline.lineTo(0, (this.game.height - 147)) // figure out the timeline jump

        // Timeline events
        this.timelineDrag.events.onDragStart.add(this._startTimeline, this);
        this.timelineDrag.events.onDragStop.add(this._stopTimeline, this);
    },

    scaleUpdate: function() {

        var i;
        var uiPos;
        var x;
        var seconds;
        var minutes;
        var realTime;
        var maxWidthVar;
        var newWidth;
        var _game;
        var _timelineGroup;
        var _lineGroupUI;
        var _endOfTimeline;
        var _timeIterations;
        var _buildOrderGroup;
        var __gameWidth;
        var val;

        _game = this.game;
        _timelineGroup = this.timelineGroup;
        _lineGroupUI = this.lineGroupUI;
        _buildOrderGroup = this.buildOrderGroup;

        __gameWidth = _game.width;

        uiPos = __gameWidth - 310;

        this.unitGroupUI.x = uiPos;
        this.structureGroupUI.x = uiPos;
        this.upgradeGroupUI.x = uiPos;

        this.starsCover.x = __gameWidth - 321;
        this.starsCoverTop.x = __gameWidth - 364;
        this.scrollBar.x = __gameWidth - 33;
        this.scrollingBar.x = __gameWidth - 31;

        if (this.race !== 'zerg') {

            this.mineralIcon.x = __gameWidth - 800;
            this.mineralText.x = __gameWidth - 750;
            this.gasIcon.x = __gameWidth - 675;
            this.gasText.x = __gameWidth - 625;
            this.supplyIcon.x = __gameWidth - 550;
            this.supplyText.x = __gameWidth - 500;
            this.energyIcon.x = __gameWidth - 395;
            this.energyText.x = __gameWidth - 345;

            // Zerg includes larva
        } else {

            this.mineralIcon.x = __gameWidth - 800 - 100;
            this.mineralText.x = __gameWidth - 750 - 100;
            this.gasIcon.x = __gameWidth - 675 - 100;
            this.gasText.x = __gameWidth - 625 - 100;
            this.supplyIcon.x = __gameWidth - 550 - 100;
            this.supplyText.x = __gameWidth - 500 - 100;
            this.energyIcon.x = __gameWidth - 395 - 100;
            this.energyText.x = __gameWidth - 345 - 100;
            this.larvaIcon.x = __gameWidth - 300 - 100;
            this.larvaText.x = __gameWidth - 250 - 100;
        }


        // Stop timeline when it reaches UI
        this.endOfTimeline = __gameWidth - 319;
        _endOfTimeline = this.endOfTimeline;


        // *************** DESKTOP STUFF ONLY ***************
        if (_game.device.desktop) 
            this.timeIterations = Math.floor((__gameWidth - 232) / 90) + 1;
        else
            return;

        _timeIterations = this.timeIterations;


        // 'dynamic' green line, this index used to crop it off the side of the UI
        this.greenLineIndex = 1 + ((_timeIterations) * 3) - 1;

        //if (_timelineDrag.x > __gameWidth - 390 - (__gameWidth % 3)) 
        //    _timeline.x = __gameWidth - 366 - (__gameWidth % 3);

        // DESKTOP - Adjust gray timeline bar to scroll time backwards if desktop re-scaling maxes out the time distance (hits UI)
        if (this.timelineDrag.x > __gameWidth - 390 - (__gameWidth % 3)) {

            this.timeline.x = __gameWidth - 366 - (__gameWidth % 3);
            this.timelineDrag.x = __gameWidth - 390 - (__gameWidth % 3);
            //this.timeline.x = __gameWidth - 332;

            // Get time string
            this.timeValue = Math.floor((-(_timelineGroup.x / 3) + (this.timeLandmarks * 30)) + (this.timeline.x / 3));
            minutes = Math.floor(this.timeValue / 60).toString();
            seconds = this.pad((this.timeValue % 60), 2);
            realTime = (minutes + ":" + seconds);
            this.currentTimeText.setText(realTime);
        }

        _lineGroupUI.getAt(0).x = __gameWidth - 330;

        // Below resources
        _lineGroupUI.getAt(1).x = __gameWidth - 329;
        _lineGroupUI.getAt(1).clear();
        _lineGroupUI.getAt(1).moveTo(0, 0);
        _lineGroupUI.getAt(1).lineStyle(3, this.uiColor, 1);
        _lineGroupUI.getAt(1).lineTo(-__gameWidth + 320, 0);

        // Build order UI line
        _lineGroupUI.getAt(2).clear();
        _lineGroupUI.getAt(2).moveTo(0, 0);
        _lineGroupUI.getAt(2).lineStyle(3, this.uiColor, 0.5);
        _lineGroupUI.getAt(2).lineTo(__gameWidth + 10, 0);

        _lineGroupUI.getAt(4).moveTo(0, 0);
        _lineGroupUI.getAt(4).lineTo(__gameWidth - 323, 0);
        _lineGroupUI.getAt(4).width = __gameWidth - 315;
        

        // Strech background to fit the screen
        //if (_game.device.desktop && this.bg !== null && __gameWidth > 960)
        //    this.bg.width = __gameWidth;
        //else if (this.bg !== null)
        //    this.bg.width = 960;


        // Control visibility of time indicators based on width
        _timelineGroup.forEach(this._updateTimelineVisibility, this, false, _timelineGroup, _endOfTimeline);


        // Resize build order scroll bar
        if (((this.buildOrderGroup.length / 2) * 65) > this.game.width) {
            maxWidthVar = ((_buildOrderGroup.length / 2) * 65)
            newWidth = __gameWidth - (__gameWidth * ((maxWidthVar - __gameWidth) / maxWidthVar));


            // Redraw the build order scroll bar line
            //this.buildOrderScrollingBar.clear();
            //this.buildOrderScrollingBar.moveTo(0, 0);
            //this.buildOrderScrollingBar.lineStyle(3, this.uiColor, 1);
            //this.buildOrderScrollingBar.lineTo(newWidth, 0);
            this.buildOrderScrollingBar.width = newWidth;


            // Update variables relevant to scrolling
            this.widthDifference = maxWidthVar - __gameWidth;
            this.gameAndBuildOrderWidth = __gameWidth - newWidth;


            // Move build order group to compensate for screen pushing
            val = this.widthDifference * (this.buildOrderScrollingBar.x / this.gameAndBuildOrderWidth);
            this.buildOrderGroup.x = -val + 3;
            _buildOrderGroup.forEach(this._checkBounds, this, false, __gameWidth);


            if (this.buildOrderScrollingBar.x + newWidth > __gameWidth)
                this.buildOrderScrollingBar.x -= (this.buildOrderScrollingBar.x + newWidth) - __gameWidth;


            // If build order fits on screen, keep build order scroll bar width to maximum    
        } else {

            //this.buildOrderScrollingBar.clear();
            //this.buildOrderScrollingBar.moveTo(0, 0);
            //this.buildOrderScrollingBar.lineStyle(3, this.uiColor, 1);
            //this.buildOrderScrollingBar.lineTo(__gameWidth, 0);
            this.buildOrderScrollingBar.width = __gameWidth;
        }


        // Adjust scroll bar if past right side of screen
        if (newWidth + this.buildOrderScrollingBar.x > __gameWidth)
            this.buildOrderScrollingBar.x = __gameWidth - newWidth;
    },

    _updateTimelineVisibility: function(sprite, _timelineGroup, _endOfTimeline) {

        if (sprite.x + _timelineGroup.x > _endOfTimeline) {
            sprite.visible = false;
        } else if (!sprite.visible) {
            sprite.visible = true;
        }
    },

    _startTimeline: function(line) {

        this.timelineScrolling = true;
    },

    _stopTimeline: function(line) {

        this.timelineScrolling = false;

        if (line.x >= this.game.width - 390 - (this.game.width % 3)) {

            line.x = this.game.width - 390 - (this.game.width % 3);
        }

        if (line.x < 0 && this.timeLandmarks != -1)
            line.x = 0;
        else if (line.x < -24)
            line.x = -24;

        // Update gray timeline bar location
        this.timeline.x = line.x + 24;


        // Re-update time
        this.timeValue = (-(this.timelineGroup.x / 3) + (this.timeLandmarks * 30)) + ((this.timeline.x) / 3);
        minutes = Math.floor(this.timeValue / 60).toString();
        seconds = this.pad((this.timeValue % 60), 2);
        realTime = (minutes + ":" + seconds);
        // Set the time according to timeline location
        this.currentTimeText.setText(realTime);
    },

    initBases: function() {

        // 8 patches per base.
    },

    initWorkers: function() {

        // Per base.  
    },

    updateResources: function() {

        //console.log(this.timeValue);
    },

    _crop: function(sprite) {

        if ((sprite.y + sprite.parent.y) > this.game.height) {

            sprite.visible = false;
        } else if (!sprite.visible) {

            sprite.visible = true;
        }
    },

    _scrollBar: function() {

        var scrollValue;

        this.isScrolling = !this.isScrolling;

        if (!this.isScrolling)
            return;

        scrollValue = (this.game.input.activePointer.y - this.scrollingBar.y);

        this.scrollDifference = scrollValue;
    },

    _buildOrderScrollingBar: function() {

        var scrollValue;


        // On hold, if pointer is on top of screen
        if (this.game.input.activePointer.y < 70) {


            // Start actively scrolling in (f)update
            this.scrollBuildOrder = true;


            // Set the starting point of the pointer relevant to the build order scrollbar position
            scrollValue = (this.game.input.activePointer.x - this.buildOrderScrollingBar.x);
            this.buildOrderScrollDifference = scrollValue;
        }
    },

    createUnits: function() {

        var xx;
        var yy;
        var x;
        var y;
        var index;
        var text_texture;
        var icon;
        var name;
        var underline;
        var _game;
        var _unitGroupUI;
        var __gameWidth;

        _game = this.game;
        _unitGroupUI = this.unitGroupUI;

        __gameWidth = this.game.width;

        index = 0;

        _unitGroupUI.x = __gameWidth - 310;
        _unitGroupUI.y = 84;

        var _name = _game.make.bitmapText(0, 0, 'Agency_35', 'Units', 35);
        var text_texture = _name.generateTexture();
        name = _game.make.image(5, 5, text_texture);
        name.tint = this.uiColor;
        _name.destroy();

        underline = _game.make.image(2, 30, 'ui-white-square');
        underline.tint = this.uiColor;
        underline.height = 1;
        underline.width = name.width + 5;

        _unitGroupUI.add(name);
        _unitGroupUI.add(underline);

        for (yy = 0; yy <= 7; yy++) {

            if (index + 1 > this.unitCount)
                return;

            this.maxScrollCount++;

            for (xx = 0; xx < 4; xx++) {

                index++;

                if (index > this.unitCount)
                    return;

                var x = xx * 62 + (xx * 7);
                var y = yy * 62 + (yy * 7) + 35;

                //icon = this.game.add.sprite(x - 3, y - 3, 'icon');
                //icon.width = 66;
                //icon.height = 66;
                //icon.tint = this.uiColor;
                //_unitGroupUI.add(icon);

                var texture = this._getUnitTexture(index);

                this._createEntity(x, y, texture, _unitGroupUI);

            }
        }
    },

    createStructures: function() {

        var xx;
        var yy;
        var x;
        var y;
        var index;
        var text_texture;
        var icon;
        var name;
        var underline;
        var _game;
        var _structureCount;
        var _structureGroupUI;

        _game = this.game;
        _structureCount = this.structureCount;
        _structureGroupUI = this.structureGroupUI;

        index = 0;

        this.structureGroupUI.y = this.unitGroupUI.y + this.unitGroupUI.height + 10;

        var _name = _game.make.bitmapText(0, 0, 'Agency_35', 'Buildings', 35);
        var text_texture = _name.generateTexture();
        name = _game.make.image(5, 5, text_texture);
        name.tint = this.uiColor;
        _name.destroy();

        underline = _game.make.image(2, 30, 'ui-white-square');
        underline.tint = this.uiColor;
        underline.height = 1;
        underline.width = name.width + 5;

        _structureGroupUI.add(name);
        _structureGroupUI.add(underline);

        for (yy = 0; yy <= 7; yy++) {

            if (index + 1 > this.structureCount)
                return;

            this.maxScrollCount++;

            for (xx = 0; xx < 4; xx++) {

                index++;

                if (index > this.structureCount)
                    return;

                var x = xx * 62 + (xx * 7);
                var y = yy * 62 + (yy * 7) + 35;

                //icon = this.game.add.sprite(x - 3, y - 2, 'icon');
                //icon.width = 66;
                //icon.height = 66;
                //icon.tint = 0xff0000;

                //this.structureGroupUI.add(icon);

                var texture = this._getStructureTexture(index);

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
        var text_texture;
        var icon;
        var name;
        var underline;
        var _game;
        var _upgradeGroupUI;

        _game = this.game;
        _upgradeGroupUI = this.upgradeGroupUI;

        index = 0;

        this.upgradeGroupUI.y = this.unitGroupUI.y + this.unitGroupUI.height + this.structureGroupUI.height + 20;

        var _name = _game.make.bitmapText(0, 0, 'Agency_35', 'Upgrades', 35);
        var text_texture = _name.generateTexture();
        name = _game.make.image(5, 5, text_texture);
        name.tint = this.uiColor;
        _name.destroy();

        underline = _game.make.image(2, 30, 'ui-white-square');
        underline.tint = this.uiColor;
        underline.height = 1;
        underline.width = name.width + 5;

        _upgradeGroupUI.add(name);
        _upgradeGroupUI.add(underline);

        for (yy = 0; yy <= 7; yy++) {

            if (index + 1 > this.upgradeCount)
                return;

            this.maxScrollCount++;

            for (xx = 0; xx < 4; xx++) {

                index++;

                if (index > this.upgradeCount)
                    return;

                var x = xx * 62 + (xx * 7);
                var y = yy * 62 + (yy * 7) + 35;

                //icon = this.game.add.sprite(x - 3, y - 2, 'icon');
                //icon.width = 66;
                //icon.height = 66;

                //this.upgradeGroupUI.add(icon);

                var texture = this._getUpgradeTexture(index);

                this._createEntity(x, y, texture, this.upgradeGroupUI);

            }
        }
    },

    _createEntity: function(x, y, texture, group) {

        var sprite;

        sprite = this.game.make.button(x, y, this.race, null, this, texture + "-highlight", texture, texture, texture);

        sprite.onInputUp.add(this.unitPressed, this);

        //console.log(sprite.width) //lolol theres still a sprite in terran with 62 width
        group.add(sprite);
    },

    unitPressed: function(unit) {

        var sprite;
        var x;
        var supply;
        var newWidth;
        var maxWidthVar;
        var startX;
        var val;
        var _game;
        var _buildOrderGroup;
        var __gameWidth;
        var __gameHeight;

        _game = this.game;
        _buildOrderGroup = this.buildOrderGroup;

        __gameWidth = _game.width;
        __gameHeight = _game.height;

        x = Math.floor(_buildOrderGroup.length / 2) * 65;

        sprite = _game.add.sprite(x, 0, unit.texture);
        sprite.inputEnabled = true;
        supply = _game.add.bitmapText(x, 0, 'Agency_35', this.supply.toString(), 28);
        supply.tint = this.uiColor;
        sprite.events.onInputUp.add(this._removeBuildOrderSprite, this, 0, supply);
        _buildOrderGroup.add(sprite);
        _buildOrderGroup.add(supply);

        // If the added selection exceeds the width of the screen
        if (sprite.x + _buildOrderGroup.x > __gameWidth - 65) {

            // Variables for width of build order scroll bar
            maxWidthVar = ((_buildOrderGroup.length / 2) * 65)
            newWidth = __gameWidth - (__gameWidth * ((maxWidthVar - __gameWidth) / maxWidthVar));
            startX = __gameWidth - newWidth;

            // Redraw the build order scroll bar line
            this.buildOrderScrollingBar.x = startX;
            this.buildOrderScrollingBar.width = newWidth;


            // Update variables relevant to scrolling
            this.widthDifference = maxWidthVar - __gameWidth;
            this.gameAndBuildOrderWidth = __gameWidth - newWidth;


            // Move build order group to compensate for screen pushing
            val = this.widthDifference * (this.buildOrderScrollingBar.x / this.gameAndBuildOrderWidth);
            this.buildOrderGroup.x = -val + 3;
            _buildOrderGroup.forEach(this._checkBounds, this, false, __gameWidth);
        }
    },

    _checkBounds: function(sprite, _gameWidth) {

        if (sprite.x + sprite.parent.x < -70 || sprite.x + sprite.parent.x > _gameWidth) {

            sprite.alive = false;
            sprite.visible = false;
            sprite.exists = false;

        } else {

            sprite.exists = true;
            sprite.visible = true;
            sprite.alive = true;
        }
    },

    _checkBoundsOnScaleUpdate: function(sprite) {

        //if (sprite.)
    },

    _removeBuildOrderSprite: function(sprite, a, b, supply) {

        var maxWidthVar;
        var newWidth;
        var _buildOrderGroup;
        var _game;
        var _buildOrderScrollingBar;
        var __gameWidth;

        _buildOrderGroup = this.buildOrderGroup;
        _buildOrderScrollingBar = this.buildOrderScrollingBar;
        _game = this.game;
        __gameWidth = _game.width;


        if (!sprite.getBounds().contains(_game.input.activePointer.x, _game.input.activePointer.y) || !this.allowRemove)
            return;


        // Remove build order sprite and supply number from group
        _buildOrderGroup.remove(sprite, true);
        _buildOrderGroup.remove(supply, true);


        // Reposition the rest of the build order group
        _buildOrderGroup.forEach(this.__updateBuildOrderSprite, this);


        // Variables for width of build order scroll bar
        maxWidthVar = ((_buildOrderGroup.length / 2) * 65)
        newWidth = __gameWidth - (__gameWidth * ((maxWidthVar - __gameWidth) / maxWidthVar));


        // Adjust scroll bar if past right side of screen
        if (newWidth + this.buildOrderScrollingBar.x > __gameWidth)
            this.buildOrderScrollingBar.x = __gameWidth - newWidth;


        // Adjust scroll bar if past left side of screen
        if (this.buildOrderScrollingBar.x < 0)
            this.buildOrderScrollingBar.x = 0;


        // Set scroll bar length to game width if theres no build order
        if (_buildOrderGroup.length === 0)
            newWidth = __gameWidth;


        // Redraw the build order scroll bar line
        //this.buildOrderScrollingBar.clear();
        //this.buildOrderScrollingBar.moveTo(0, 0);
        //this.buildOrderScrollingBar.lineStyle(3, this.uiColor, 1);
        //this.buildOrderScrollingBar.lineTo(newWidth, 0);
        this.buildOrderScrollingBar.width = newWidth;

        // Update variables relevant to scrolling
        this.widthDifference = maxWidthVar - __gameWidth;
        this.gameAndBuildOrderWidth = __gameWidth - newWidth;


        // Move build order group to compensate for screen pushing
        if (this.buildOrderGroup.width + 10 > __gameWidth) {
            val = this.widthDifference * (this.buildOrderScrollingBar.x / this.gameAndBuildOrderWidth);
            this.buildOrderGroup.x = -val + 3;
        } else {
            this.buildOrderGroup.x = 3;
        }


        // Crop sprites outside left of screen
        _buildOrderGroup.forEach(this._checkBounds, this, false, __gameWidth);
    },

    __updateBuildOrderSprite: function(sprite) {

        sprite.x = Math.floor(sprite.z / 2) * 65;
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