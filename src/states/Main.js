function Main() {}

//micro'd
// 0:30 min - 350    - 0
// 1:00 min - 705    - 50
// 1:30 min - 1065   - 50
// 2:00 min - 1425   - 35
// 2:30 min - 1775   - 90
// 3:00 min - 2145   - 80
// 3:30 min - 2495   - 135
// 4:00 min - 2855   - 135
// 4:30 min - 3215   - 135
// 5:00 min - 3570   - 185
// 5:30 min - 3925   - 190
// 6:00 min - 4285   - 190
// 7:00 min - 5005   - 220
// 8:00 min - 5705   - 285

//no micro
// 1:00 min - 700
// 2:00 min - 1410
// 3:00 min - 2100
// 4:00 min - 2795
// 5:00 min - 3505
// 7:00 min - 4905
// 8:00 min - 5595


// 30 sec - 360
// 1 min - 710
// 2 min - 1430
// 2:30 min - 1800
// 3 min - 2145


//4.7 short


//3 min - 2115
//2 min - 1415
//1 min - 705
//4.7 short
//5.1 long

//6 min - 3065
//3 min - 1530
//2 min - 1025

//6.5 short
//7.5 long


/*
//val2 = (this.timeValue - this.workerArray[i][1]) / 4.3;

//val2 = (((_timeValue - 5) - this.workerArray[i][1]) * 1.76); //0.2
val2 = (this.timeValue - 6) - this.workerArray[i][1];
//console.log((((_timeValue)) - (((_timeValue)) % 5)));

//4.8 = long round trip time
//3.8 = short round trip time
//2.94 = mining time

//2.68 = long round trip time
//2.28 = short round trip time
//1.76 = mining time

*/





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



// IT IS TIME!!!!!!!!!!!!!!!!!!!

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
                this.game.load.json('terran-data', 'assets/terran-data.json');
                break;

            case 'protoss':
                this.game.load.atlas('protoss', 'assets/protoss.png', 'assets/protoss.json');
                this.load.image('gas', 'assets/protoss-gas.png');
                this.load.image('supply', 'assets/pylon-supply.png');
                this.game.load.json('protoss-data', 'assets/protoss-data.json');
                break;

            case 'zerg':
                this.game.load.atlas('zerg', 'assets/zerg.png', 'assets/zerg.json');
                this.load.image('gas', 'assets/zerg-gas.png');
                this.load.image('supply', 'assets/overlord-supply.png');
                this.load.image('larva', 'assets/larva.png');
                this.game.load.json('zerg-data', 'assets/zerg-data.json');
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
        this.actionGroupUIHeight = 0;
        this.unitGroupUIHeight = 0;
        this.structureGroupUIHeight = 0;
        this.upgradeGroupUIHeight = 0;

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

        switch (this.race) {

            case 'terran':
                startingBuilding = 'command-center';
                startingWorker = 'scv';
                this.actionCount = 8;
                this.unitCount = 16;
                this.structureCount = 17;
                this.upgradeCount = 25;
                break;

            case 'protoss':
                startingBuilding = 'nexus';
                startingWorker = 'probe';
                this.actionCount = 6;
                this.unitCount = 22;
                this.structureCount = 14;
                this.upgradeCount = 25;
                break;

            case 'zerg':
                startingBuilding = 'hatchery';
                startingWorker = 'drone';
                this.actionCount = 6;
                this.unitCount = 16;
                this.structureCount = 17;
                this.upgradeCount = 28;
                break;
        }


        this.structureArray = this.createArray(80, 2);
        this.unitArray = this.createArray(100, 2);
        this.upgradeArray = this.createArray(80, 2);

        this.workerArray = this.createArray(80, 2);
        this.structureArray[0] = startingBuilding;


        // Create the first 12 workers with small delays
        for (var i = 0; i < 12; i++) {
            this.workerArray[i][0] = startingWorker;

            if (i < 8)
                this.workerArray[i][1] = 1;
            else
                this.workerArray[i][1] = 2;
        }
    

        this.timelineGroup = this.game.add.group();
        this.starsCover = this.game.add.image(this.game.width - 334, 114, 'stars-cover');
        this.actionGroupUI = this.game.add.group();
        this.unitGroupUI = this.game.add.group();
        this.structureGroupUI = this.game.add.group();
        this.upgradeGroupUI = this.game.add.group();
        this.unitTimelineGroup = this.game.add.group();
        this.structureTimelineGroup = this.game.add.group();
        this.upgradeTimelineGroup = this.game.add.group();
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


        this.initTimeline();

        this.initUI();

        this.createSelectionUI();

        this.initBases();

        this.initWorkers();

        //this.actionGroupUI.cacheAsBitmap = true;
        //this.unitGroupUI.cacheAsBitmap = true;
        //this.structureGroupUI.cacheAsBitmap = true;
        //this.upgradeGroupUI.cacheAsBitmap = true;

        // Next: boxes for constructing, use filled rectangles

        this.timer = _game.time.create(true);
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
            if (_timelineDrag.x <= 20 && this.timeLandmarks != -5) {


                // Move time/line group
                _timelineGroup.x += 3;


                // If scrolled past the width of a 30 second time block, reset lineGroup position and change times to align
                if (_timelineGroup.x >= 0) {

                    _timelineGroup.x = -450;

                    this.timeLandmarks -= 5;
                    _timeLandmarks = this.timeLandmarks;


                    // Update time texts
                    for (i = 0; i < _timeIterations * 3; i++) {

                        var timeVal = (i + _timeLandmarks - 1) * 30;
                        var minutes = Math.floor(timeVal / 60).toString();
                        var seconds = this.pad((timeVal % 60), 2);
                        var realTime = (minutes + ":" + seconds);

                        var time = _timelineGroup.getAt((i * 3));

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
                if (_timelineGroup.x <= -450) {

                    _timelineGroup.x = 0;

                    this.timeLandmarks += 5;
                    _timeLandmarks = this.timeLandmarks;


                    // Update time texts
                    for (i = 0; i < _timeIterations * 3; i++) {

                        var timeVal = (i + _timeLandmarks - 1) * 30;
                        var minutes = Math.floor(timeVal / 60).toString();
                        var seconds = this.pad((timeVal % 60), 2);
                        var realTime = (minutes + ":" + seconds);

                        var time = _timelineGroup.getAt((i * 3));

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
            var unitY;
            var structureY;
            var upgradeY;
            var _scrollingBar;
            var _game;
            var _actionGroupUI;
            var _unitGroupUI;
            var _structureGroupUI;
            var _upgradeGroupUI;
            var _heightDifference;
            var _gameAndScrollHeight;
            var _actionGroupUIHeight;
            var _unitGroupUIHeight;
            var _structureGroupUIHeight;
            var _upgradeGroupUIHeight;


            _scrollingBar = this.scrollingBar;
            _game = this.game;
            _actionGroupUI = this.actionGroupUI;
            _unitGroupUI = this.unitGroupUI;
            _structureGroupUI = this.structureGroupUI;
            _upgradeGroupUI = this.upgradeGroupUI;
            _heightDifference = this.heightDifferece;
            _gameAndScrollHeight = this.gameAndScrollHeight;
            _actionGroupUIHeight = this.actionGroupUIHeight;
            _unitGroupUIHeight = this.unitGroupUIHeight;
            _structureGroupUIHeight = this.structureGroupUIHeight;
            _upgradeGroupUIHeight = this.upgradeGroupUIHeight;


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


            _actionGroupUI.y = -val;
            unitY = _actionGroupUI.y + _actionGroupUIHeight + 10;
            structureY = _actionGroupUI.y + _actionGroupUIHeight + _unitGroupUIHeight + 20;
            upgradeY = _actionGroupUI.y + + _actionGroupUIHeight + _unitGroupUIHeight + _structureGroupUIHeight + 30;

            _unitGroupUI.y = unitY;
            _structureGroupUI.y = structureY;
            _upgradeGroupUI.y = upgradeY;


            // Cropping icons
            _actionGroupUI.forEach(this._crop, this);
            _unitGroupUI.forEach(this._crop, this);
            _structureGroupUI.forEach(this._crop, this);
            _upgradeGroupUI.forEach(this._crop, this);
        }
    },

    _inputUp: function() {

        this.scrollBuildOrder = false;

        this.game.time.events.add(10, this.__allowRemove, this)
    },

    __allowRemove: function() {

        this.allowRemove = true;
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

        this.mineralText = _game.add.bitmapText(__gameWidth - 750, 74, 'Agency_35_nums', '50', 35);
        this.mineralText.tint = _uiColor;

        this.gasIcon = _game.add.sprite(__gameWidth - 650, 71, 'gas');
        this.gasIcon.width = 40;
        this.gasIcon.height = 40;

        this.gasText = _game.add.bitmapText(__gameWidth - 600, 74, 'Agency_35_nums', '0', 35);
        this.gasText.tint = _uiColor;

        this.supplyIcon = _game.add.sprite(__gameWidth - 500, 70, 'supply');
        this.supplyIcon.width = 42;
        this.supplyIcon.height = 42;

        this.supplyText = _game.add.bitmapText(__gameWidth - 450, 74, 'Agency_35_nums', '12/15', 35);

        this.energyIcon = _game.add.sprite(__gameWidth - 375, 70, 'energy');
        this.energyIcon.width = 42;
        this.energyIcon.height = 42;

        this.energyText = _game.add.bitmapText(__gameWidth - 325, 74, 'Agency_35_nums', '0', 35);

        if (this.race === 'zerg') {

            this.larvaIcon = _game.add.sprite(__gameWidth - 375, 70, 'larva');
            this.larvaIcon.width = 42;
            this.larvaIcon.height = 42;

            this.larvaText = _game.add.bitmapText(__gameWidth - 325, 74, 'Agency_35_nums', '0', 35);
        }


        if (_game.device.desktop) {

            // Desktop
            this.timeIterations = Math.floor((__gameWidth - 232) / 90) + 6;//25; //Math.floor((__gameWidth - 232) / 90) + 1;
        } else {

            // Mobile
            this.timeIterations = Math.floor((__gameWidth - 232) / 90) + 6;
        }


        // Time texts
        for (i = 0; i < this.timeIterations; i++) {

            _timeValue = (i - 1) * 30;

            var timeString1 = Math.floor(_timeValue / 60).toString();
            var timeString2 = this.pad((_timeValue % 60), 2);
            var timeString = timeString1 + ":" + timeString2;
            var time = _game.add.bitmapText(-85 + (i * 90), 122, 'Agency_35_nums', timeString, 25);

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
        this.currentTimeText = _game.add.bitmapText(10, 74, 'Agency_35_nums', '0:00', 35);


        //Build order scroll bar
        this.buildOrderScrollingBar = _game.add.image(0, 65, 'ui-white-square');
        this.buildOrderScrollingBar.width = __gameWidth;
        this.buildOrderScrollingBar.height = 3;
    },

    createSelectionUI: function() {

        var xx0;
        var yy0;
        var xx1;
        var yy1;
        var xx2;
        var yy2;
        var xx3;
        var yy3;
        var x;
        var y;
        var raceJSON;
        var index;
        var text_texture;
        var icon;
        var name;
        var underline;

        var maxHeightVar;
        var heightDiffereceVar;
        var scrollingBarHeightVar;
        var gameAndScrollHeightVar;
        var structureY;
        var upgradeY;
        var _game;
        var _actionGroupUI;
        var _unitGroupUI;
        var _structureGroupUI;
        var _upgradeGroupUI;
        var _actionCount;
        var _unitCount;
        var _structureCount;
        var _upgradeCount;
        var _race;
        var _uiColor;
        var _unitPressed;
        var __gameWidth;


        _game = this.game;
        _actionGroupUI = this.actionGroupUI;
        _unitGroupUI = this.unitGroupUI;
        _structureGroupUI = this.structureGroupUI;
        _upgradeGroupUI = this.upgradeGroupUI;
        _actionCount = this.actionCount;
        _unitCount = this.unitCount;
        _structureCount = this.structureCount;
        _upgradeCount = this.upgradeCount;
        _race = this.race;
        _uiColor = this.uiColor;
        _unitPressed = this.unitPressed;
        __gameWidth = this.game.width;


        raceJSON = this.game.cache.getJSON(_race + '-data');



        ///////////////////////////////////////////////////////////
        //                       ACTIONS                         //
        ///////////////////////////////////////////////////////////
        index = 0;

        _actionGroupUI.x = __gameWidth - 310;
        _actionGroupUI.y = 84;

        var _name = _game.make.bitmapText(0, 0, 'Agency_35', 'Actions', 35);
        var text_texture = _name.generateTexture();
        name = _game.make.image(5, 5, text_texture);
        name.tint = _uiColor;
        _name.destroy();

        underline = _game.make.image(2, 30, 'ui-white-square');
        underline.tint = _uiColor;
        underline.height = 1;
        underline.width = name.width + 5;

        _actionGroupUI.add(name);
        _actionGroupUI.add(underline);

        for (yy0 = 0; yy0 <= 1; yy0++) {

            this.maxScrollCount++;

            for (xx0 = 0; xx0 < 4; xx0++) {

                index++;

                if (index > _actionCount)
                    break;

                var x = xx0 * 62 + (xx0 * 7);
                var y = yy0 * 62 + (yy0 * 7) + 35;

                var textureGroup = _game.make.group();
                var icon = _game.make.image(x - 3, y - 2, 'ui-white-square');
                icon.width = 66;
                icon.height = 66;
                icon.tint = _uiColor;
                var textureName = raceJSON.actions[index - 1].name;
                var image = _game.make.image(x, y, _race, textureName);
                textureGroup.add(icon);
                textureGroup.add(image);
                var texture = textureGroup.generateTexture();
                textureGroup.destroy();

                var sprite = _game.make.sprite(x, y, texture);
                sprite.inputEnabled = true;
                sprite.events.onInputUp.add(_unitPressed, this);
                _actionGroupUI.add(sprite);
            }
        }
        this.actionGroupUIHeight = _actionGroupUI.height;

        ///////////////////////////////////////////////////////////
        //                       UNITS                           //
        ///////////////////////////////////////////////////////////
        index = 0;

        _unitGroupUI.y = _actionGroupUI.y + _actionGroupUI.height + 10;

        var _name = _game.make.bitmapText(0, 0, 'Agency_35', 'Units', 35);
        var text_texture = _name.generateTexture();
        name = _game.make.image(5, 5, text_texture);
        name.tint = _uiColor;
        _name.destroy();

        underline = _game.make.image(2, 30, 'ui-white-square');
        underline.tint = _uiColor;
        underline.height = 1;
        underline.width = name.width + 5;

        _unitGroupUI.add(name);
        _unitGroupUI.add(underline);

        for (yy1 = 0; yy1 <= 7; yy1++) {

            if (index + 1 > _unitCount)
                break;

            this.maxScrollCount++;

            for (xx0 = 0; xx0 < 4; xx0++) {

                index++;

                if (index > _unitCount)
                    break;

                var x = xx0 * 62 + (xx0 * 7);
                var y = yy1 * 62 + (yy1 * 7) + 35;

                var textureGroup = _game.make.group();
                var icon = _game.make.image(x - 3, y - 2, 'ui-white-square');
                icon.width = 66;
                icon.height = 66;
                icon.tint = _uiColor;
                var textureName = raceJSON.units[index - 1].name;
                var image = _game.make.image(x, y, _race, textureName);
                textureGroup.add(icon);
                textureGroup.add(image);
                var texture = textureGroup.generateTexture();
                textureGroup.destroy();

                var sprite = _game.make.sprite(x, y, texture);
                sprite.inputEnabled = true;
                sprite.events.onInputUp.add(_unitPressed, this);
                _unitGroupUI.add(sprite);
            }
        }
        this.unitGroupUIHeight = _unitGroupUI.height;

        ///////////////////////////////////////////////////////////
        //                      STRUCTURES                       //
        ///////////////////////////////////////////////////////////        
        index = 0;

        _structureGroupUI.y = _actionGroupUI.y + _actionGroupUI.height + _unitGroupUI.height + 20;

        var _name = _game.make.bitmapText(0, 0, 'Agency_35', 'Buildings', 35);
        var text_texture = _name.generateTexture();
        var name = _game.make.image(5, 5, text_texture);
        name.tint = _uiColor;
        _name.destroy();

        underline = _game.make.image(2, 30, 'ui-white-square');
        underline.tint = _uiColor;
        underline.height = 1;
        underline.width = name.width + 5;

        _structureGroupUI.add(name);
        _structureGroupUI.add(underline);


        for (yy2 = 0; yy2 <= 7; yy2++) {

            if (index + 1 > _structureCount)
                break;

            this.maxScrollCount++;

            for (xx2 = 0; xx2 < 4; xx2++) {

                index++;

                if (index > _structureCount)
                    break;

                var x = xx2 * 62 + (xx2 * 7);
                var y = yy2 * 62 + (yy2 * 7) + 35;

                var textureGroup = _game.make.group();
                var icon = _game.make.image(x - 3, y - 2, 'ui-white-square');
                icon.width = 66;
                icon.height = 66;
                icon.tint = _uiColor;
                var textureName = raceJSON.structures[index - 1].name;
                var image = _game.make.image(x, y, _race, textureName);
                textureGroup.add(icon);
                textureGroup.add(image);
                var texture = textureGroup.generateTexture();
                textureGroup.destroy();

                var sprite = _game.make.sprite(x, y, texture);
                sprite.inputEnabled = true;
                sprite.events.onInputUp.add(_unitPressed, this);
                _structureGroupUI.add(sprite);
            }
        }
        this.structureGroupUIHeight = _structureGroupUI.height;
        ///////////////////////////////////////////////////////////
        //                      UPGRADES                         //
        ///////////////////////////////////////////////////////////
        index = 0;

        _upgradeGroupUI.y = _actionGroupUI.y + _actionGroupUI.height + _unitGroupUI.height + _structureGroupUI.height + 30;

        var _name = _game.make.bitmapText(0, 0, 'Agency_35', 'Upgrades', 35);
        var text_texture = _name.generateTexture();
        name = _game.make.image(5, 5, text_texture);
        name.tint = _uiColor;
        _name.destroy();

        underline = _game.make.image(2, 30, 'ui-white-square');
        underline.tint = _uiColor;
        underline.height = 1;
        underline.width = name.width + 5;

        _upgradeGroupUI.add(name);
        _upgradeGroupUI.add(underline);

        for (yy = 0; yy <= 7; yy++) {

            if (index + 1 > _upgradeCount)
                break;

            this.maxScrollCount++;

            for (xx = 0; xx < 4; xx++) {

                index++;

                if (index > _upgradeCount)
                    break;

                var x = xx * 62 + (xx * 7);
                var y = yy * 62 + (yy * 7) + 35;

                var textureGroup = _game.make.group();
                var icon = _game.make.image(x - 3, y - 2, 'ui-white-square');
                icon.width = 66;
                icon.height = 66;
                icon.tint = _uiColor;
                var textureName = raceJSON.upgrades[index - 1].name;
                var image = _game.make.image(x, y, _race, textureName);
                textureGroup.add(icon);
                textureGroup.add(image);
                var texture = textureGroup.generateTexture();
                textureGroup.destroy();

                var sprite = _game.make.sprite(x, y, texture);
                sprite.inputEnabled = true;
                sprite.events.onInputUp.add(_unitPressed, this);
                _upgradeGroupUI.add(sprite);
            }
        }
        this.upgradeGroupUIHeight = _upgradeGroupUI.height;


        //Adjustment
        __gameHeight = _game.height - 67;

        // Set state-wide size variables
        maxHeightVar = this.actionGroupUI.height + this.unitGroupUI.height + this.structureGroupUI.height + this.upgradeGroupUI.height + 20;
        this.maxHeight = maxHeightVar;

        heightDiffereceVar = (this.maxHeight - __gameHeight + 40);
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
        this.structureGroupUI.forEach(this._crop, this);
        this.upgradeGroupUI.forEach(this._crop, this);


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

        this.actionGroupUI.x = uiPos;
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

        if (sprite.x + _timelineGroup.x > _endOfTimeline || sprite.x + _timelineGroup.x < -80) {
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

        if (line.x < 0 && this.timeLandmarks != -5)
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

        var i;
        var val;
        var minerals;
        var val2;
        var workerCount;
        var _timeValue;
        var _workerArray;

        _timeValue = this.timeValue;
        _workerArray = this.workerArray;

        minerals = 50;
        workerCount = 12;

        for (i = 0; i < workerCount; i++) {

            // Time the worker was finished at
            var completedTime = _workerArray[i][1];

            // Long vs. far distance mining
            if (i < 8) 
                var trips = Math.floor((_timeValue - completedTime) / 4.9);
            else 
                var trips = Math.floor((_timeValue - completedTime) / 5.3);

            // Calculate total trips taken at this time
            if (trips < 0)
                trips = 0;
            trips *= 5;

            minerals += trips;
        }

        /*
        console.log("\n minerals: " + minerals + " difference: " + (minerals - 350) 
                        + "\n ,1:00 " + (minerals - 705) + " , " + (minerals - 1065)
                        + "\n ,2:00 " + (minerals - 1425) + " , " + (minerals - 1775)
                        + "\n ,3:00: " + (minerals - 2145) + " , " + (minerals - 2495)
                        + "\n ,4:00 " + (minerals - 2855) + " , " + (minerals - 3215)
                        + "\n ,5:00 " + (minerals - 3570) + " , " + (minerals - 3925)
                        + "\n ,6:00 " + (minerals - 4285)
                        + "\n ,7:00 " + (minerals - 5005)
                        + "\n ,8:00 " + (minerals - 5705));
        */

        // Minimum minerals
        if (val < 50)
            val = 50;

        // Set mineral text
        this.mineralText.text = minerals;
    },

    unitPressed: function(unit) {

        var sprite;
        var baseSprite;
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

        //if ()



        var pressedUnit;
        var string;
        var _game;
        var _structureTimelineGroup;
        var _unitTimelineGroup;

        _game = this.game;
        _structureTimelineGroup = this.structureTimelineGroup;
        _unitTimelineGroup = this.unitTimelineGroup;


        pressedUnit = _game.make.image(0, 0, 'ui-white-square');
        pressedUnit.buildTime = 20;
        pressedUnit.width = pressedUnit.buildTime * 3;
        pressedUnit.height = 30;
        pressedUnit.name = unit.frameName;


        _structureTimelineGroup.add(pressedUnit);

        _structureTimelineGroup.y = 150;




        ////////////////////////////////////////////////////////////////////////////////////
        // Create sprite on build order bar
        var group = this.game.add.group();
        baseSprite = _game.make.sprite(0, 0, unit.texture);
        supply = _game.make.bitmapText(0, 0, 'Agency_35_nums', this.supply.toString(), 28);
        supply.tint = this.uiColor;

        group.add(baseSprite);
        group.add(supply);

        var texture = group.generateTexture(); 

        sprite = _game.add.sprite(x, 0, texture);
        sprite.inputEnabled = true;

        sprite.events.onInputUp.add(this._removeBuildOrderSprite, this, 0, supply);
        _buildOrderGroup.add(sprite);
        _buildOrderGroup.add(supply);
        group.destroy();

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

    _crop: function(sprite) {

        if ((sprite.y + sprite.parent.y) > this.game.height || 
            (sprite.y + sprite.parent.y) < 0) {

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

    createArray: function(length) {

        var arr = new Array(length || 0),
            i = length;

        if (arguments.length > 1) {
            var args = Array.prototype.slice.call(arguments, 1);
            while(i--) arr[length-1 - i] = this.createArray.apply(this, args);
        }

        return arr;
    },

    pad: function(str, max) {

        str = str.toString();
        return str.length < max ? this.pad("0" + str, max) : str;
    }
};

module.exports = Main;