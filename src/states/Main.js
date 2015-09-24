function Main() {}

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

        this.funCount = 0;

        // Assign state variables
        this.buildHash = window.location.hash;
        this.unitCount = 0;
        this.structureCount = 0;
        this.workerCount = 12;

        this.timeline = null;
        this.maxScrollCount = 0;
        this.isScrolling = false;
        this.scrollDifference = 0;
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

        this.bg = null;

        this.bg = this.game.add.image(0, 0, 'stars')
        this.bg.alpha = 0.2;

        this.timelineGroup = this.game.add.group();
        this.starsCover = this.game.add.image(this.game.width - 334, 50, 'stars-cover');
        this.unitGroupUI = this.game.add.group();
        this.structureGroupUI = this.game.add.group();
        this.upgradeGroupUI = this.game.add.group();
        this.lineGroupUI = this.game.add.group();
        this.workerGroup = this.game.add.group();
        this.baseGroup = this.game.add.group();

        this.initTimeline();

        this.initUI();

        this.initRace();

        this.createUnits();

        this.createStructures();

        this.createUpgrades();

        this.startUI();

        this.initBases();

        this.initWorkers();

        // Next: boxes for constructing, use filled rectangles

        this.timer = _game.time.create(true);
    },

    update: function() {

        if (this.isScrolling) {

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


            // follow input with scroll bar
            scrollVal = _game.input.activePointer.y - this.scrollDifference;
            _scrollingBar.y = scrollVal;

            // scroll bar at top
            if (_scrollingBar.y < 64)
                _scrollingBar.y = 64;

            // scroll bar at bottom
            else if (_scrollingBar.y > (_game.height - _scrollingBar.height))
                _scrollingBar.y = (_game.height - _scrollingBar.height);

            // Get the percentage Y value to adjust the unit group by relevant to scroll bar
            val = this.heightDifferece * ((_scrollingBar.y - 64) / this.gameAndScrollHeight) - 10;

            _unitGroupUI.y = -val + 64;

            console.log(this.heightDifferece + " * " + _scrollingBar.y + " / " + this.gameAndScrollHeight)

            structureY = _unitGroupUI.y + _unitGroupUI.height + 10;
            upgradeY = _unitGroupUI.y + _unitGroupUI.height + this.structureGroupUI.height + 20;

            _structureGroupUI.y = structureY;
            _upgradeGroupUI.y = upgradeY;

            // Cropping icons
            _structureGroupUI.forEach(this._crop, this);
            _upgradeGroupUI.forEach(this._crop, this);
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
        var timeValue;
        var timeString1;
        var timeString2;
        var timeString;
        var time;
        var line;
        var line2;
        var line3;
        var line4;
        var _game;
        var _timelineGroup;
        var _lineGroupUI;
        var __gameWidth;
        var __gameHeight;

        _game = this.game;
        _timelineGroup = this.timelineGroup;
        _lineGroupUI = this.lineGroupUI;

        __gameWidth = _game.width;
        __gameHeight = _game.height;

        // Static scroll bar button
        this.scrollBar = _game.add.button(__gameWidth - 42, 64, '', this._scrollBar, this);
        this.scrollBar.width = 42;
        this.scrollBar.height = __gameHeight - 64;
        this.scrollBar.onInputDown.add(this._scrollBar, this);


        // Selection UI
        line = _game.make.graphics(__gameWidth - 330, 115);
        line.lineStyle(3, 0x00ff00, 1);
        line.lineTo(10, 10);
        line.lineTo(10, __gameHeight - 118);
        line.lineTo(328, __gameHeight - 118);
        line.lineTo(328, -50);
        line.lineTo(296, -50);
        line.lineTo(296, __gameHeight - 64);


        // 2nd down from top
        line2 = _game.make.graphics(__gameWidth - 330, 115);
        line2.lineStyle(3, 0x00ff00, 1);
        line2.lineTo(-1000, 0);


        // top of screen
        line3 = _game.make.graphics(0, 65);
        line3.lineStyle(3, 0x00ff00, 1);
        line3.lineTo(__gameWidth, 0);


        // small left end of screen
        line4 = _game.make.graphics(1, 65);
        line4.lineStyle(3, 0x00ff00, 1);
        line4.lineTo(0, 51);


        // Line under times
        line5 = _game.make.graphics(0, 145);
        line5.lineStyle(3, 0x00ff00, 1);
        line5.lineTo(__gameWidth - 323, 0);


        // Add all UI lines to group
        _lineGroupUI.add(line);
        _lineGroupUI.add(line2);
        _lineGroupUI.add(line3);
        _lineGroupUI.add(line4);
        _lineGroupUI.add(line5);


        // Mineral / gas / supply icons
        this.mineralIcon = _game.add.sprite(__gameWidth - 800, 71, 'minerals');
        this.mineralIcon.width = 40;
        this.mineralIcon.height = 40;

        this.mineralText = _game.add.bitmapText(__gameWidth - 750, 74, 'Agency_35', '0', 35);
        this.mineralText.tint = 0x00ff00;

        this.gasIcon = _game.add.sprite(__gameWidth - 650, 71, 'gas');
        this.gasIcon.width = 40;
        this.gasIcon.height = 40;

        this.gasText = _game.add.bitmapText(__gameWidth - 600, 74, 'Agency_35', '0', 35);
        this.gasText.tint = 0x00ff00;

        this.supplyIcon = _game.add.sprite(__gameWidth - 500, 70, 'supply');
        this.supplyIcon.width = 42;
        this.supplyIcon.height = 42;

        this.supplyText = _game.add.bitmapText(__gameWidth - 450, 74, 'Agency_35', '12/15', 35);
        //this.supplyText.tint = 0x00ff00;


        if (_game.device.desktop) {

            // Desktop
            this.timeIterations = 25; //Math.floor((__gameWidth - 232) / 90) + 1;
        } else {

            // Mobile
            this.timeIterations = Math.floor((__gameWidth - 232) / 90) + 1;
        }

        // Time texts
        for (i = 0; i < this.timeIterations; i++) {

            //For mobile, maybe make this one big bitmapdata

            timeValue = (i - 1) * 30;

            timeString1 = Math.floor(timeValue / 60).toString();
            timeString2 = this.pad((timeValue % 60), 2);

            timeString = (timeString1 + ":" + timeString2);

            time = _game.make.bitmapText(-85 + (i * 90), 122, 'Agency_35', timeString, 25);
            time.tint = 0x00ff00;
            time.index = i;
            time.seconds = timeValue;
            line = _game.make.graphics(-90 + (i * 90), 144);
            line.lineStyle(3, 0x00ff00, 1);
            line.lineTo(0, -8);

            line2 = _game.make.graphics(-90 + (i * 90), 144);
            line2.lineStyle(1, 0x00ff00, 0.2);
            line2.lineTo(0, this.game.height - 50);
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
        __gameHeight = _game.height - 64;
        __gameWidth = _game.width;


        // Set state-wide size variables
        maxHeightVar = this.unitGroupUI.height + this.structureGroupUI.height + this.upgradeGroupUI.height + 20;
        this.maxHeight = maxHeightVar;

        heightDiffereceVar = (this.maxHeight - __gameHeight + 20);
        this.heightDifferece = heightDiffereceVar;

        scrollingBarHeightVar = __gameHeight * ((this.maxHeight - __gameHeight) / this.maxHeight);


        // Create scrolling bar.  Needed to be created here.
        this.scrollingBar = _game.add.graphics(0, 64);
        this.scrollingBar.lineStyle(1, 0x00ff00, 1);
        this.scrollingBar.beginFill(0x00ff00, 0.3);
        this.scrollingBar.drawRect(0, 0, 28, scrollingBarHeightVar);


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
        this.timelineDrag = this.game.add.sprite(0, 83, '');
        this.timelineDrag.width = 36;
        this.timelineDrag.height = this.game.height - 83;
        this.timelineDrag.inputEnabled = true;
        this.timelineDrag.input.enableDrag();
        this.timelineDrag.input.enableSnap(3, 0, true, true);
        this.timelineDrag.input.allowVerticalDrag = false;

        // Gray line
        this.timeline = this.game.add.graphics(0, 83);
        this.timeline.lineStyle(2, 0x666666, 1);
        this.timeline.lineTo(0, (this.game.height - 83)) // figure out the timeline jump

        // Timeline events
        this.timelineDrag.events.onDragUpdate.add(this.updateTimeline, this);
        this.timelineDrag.events.onDragStop.add(this.stopTimeline, this);
    },

    scaleUpdate: function() {

        var i;
        var uiPos;
        var x;
        var seconds;
        var minutes;
        var realTime;
        var timeValue;
        var _game;
        var _timelineGroup;
        var _lineGroupUI;
        var _endOfTimeline;
        var _timeIterations;
        var __gameWidth;
        var val;

        _game = this.game;
        _timelineGroup = this.timelineGroup;
        _lineGroupUI = this.lineGroupUI;

        __gameWidth = _game.width;

        uiPos = __gameWidth - 310;

        this.unitGroupUI.x = uiPos;
        this.structureGroupUI.x = uiPos;
        this.upgradeGroupUI.x = uiPos;

        this.starsCover.x = __gameWidth - 318;
        this.scrollBar.x = __gameWidth - 33;
        this.scrollingBar.x = __gameWidth - 32;

        this.mineralIcon.x = __gameWidth - 800;
        this.mineralText.x = __gameWidth - 750;
        this.gasIcon.x = __gameWidth - 650;
        this.gasText.x = __gameWidth - 600;
        this.supplyIcon.x = __gameWidth - 500;
        this.supplyText.x = __gameWidth - 450;

        this.endOfTimeline = __gameWidth - 319;
        _endOfTimeline = this.endOfTimeline;

        if (_game.device.desktop)
            this.timeIterations = Math.floor((__gameWidth - 232) / 90) + 1;
        _timeIterations = this.timeIterations;


        // 'dynamic' green line, this index used to crop it off the side of the UI
        this.greenLineIndex = 1 + ((_timeIterations) * 3) - 1;


        // Adjust gray timeline bar to scroll time backwards if desktop re-scaling maxes out the time distance (hits UI)
        if (this.timeline.x > __gameWidth - 334) {

            this.timelineDrag.x = __gameWidth - 350;
            this.timeline.x = __gameWidth - 334;

            // X value of the line sprite dragged by mouse
            x = Math.floor(this.timeline.x + (this.timeline.width / 2) - 0.5);

            // Get time string
            timeValue = Math.floor((-(_timelineGroup.x / 3) + (this.timeLandmarks * 30)) + (this.timeline.x / 3));
            minutes = Math.floor(timeValue / 60).toString();
            seconds = this.pad((timeValue % 60), 2);
            realTime = (minutes + ":" + seconds);
            this.currentTimeText.setText(realTime);
        }

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
        _timelineGroup.forEach(this._scaleUpdateVisibility, this, false, _timelineGroup, _endOfTimeline);
    },

    _scaleUpdateVisibility: function(sprite, _timelineGroup, _endOfTimeline) {

        if (sprite.x + _timelineGroup.x > _endOfTimeline) {
            sprite.visible = false;
        } else {
            sprite.visible = true;
        }
    },

    updateTimeline: function(line) {

        var i;
        var x;
        var seconds;
        var minutes;
        var realTime;
        var timeValue;
        var _game;
        var _timeIterations;
        var _timelineGroup;
        var _endOfTimeline;
        var _greenLineIndex;
        var _timeline;
        var _timelineDrag;
        var _timeLandmarks;
        var __gameWidth;

        _game = this.game;
        _timeIterations = this.timeIterations;
        _timelineGroup = this.timelineGroup;
        _endOfTimeline = this.endOfTimeline;
        _greenLineIndex = this.greenLineIndex;
        _timeline = this.timeline;
        _timelineDrag = this.timelineDrag;
        _timeLandmarks = this.timeLandmarks;
        __gameWidth = _game.width;


        // Get time string
        timeValue = (-(_timelineGroup.x / 3) + (_timeLandmarks * 30)) + (_timelineDrag.x / 3);
        minutes = Math.floor(timeValue / 60).toString();
        seconds = this.pad((timeValue % 60), 2);
        realTime = (minutes + ":" + seconds);

        // If timeline is dragged to maximum left, start scrolling backwards
        if (_timelineDrag.x <= 20 && this.timeLandmarks != -1) {

            
            // Move time/line group
            _timelineGroup.x += 3;


            // Set the current time
            this.currentTimeText.setText(realTime);


            // If scrolled past the width of a 30 second time block, reset lineGroup position and change times to align
            if (_timelineGroup.x >= 0) {

                this.funCount++;
                this.mineralText.text = this.funCount.toString();

                console.log(_timelineGroup.x);

                _timelineGroup.x = -90;

                this.timeLandmarks--;

                _timeLandmarks = this.timeLandmarks;

                // Update time texts
                for (i = 0; i < _timeIterations * 3; i++) {

                    timeValue = (i + _timeLandmarks - 1) * 30;
                    minutes = Math.floor(timeValue / 60).toString();
                    seconds = this.pad((timeValue % 60), 2);
                    realTime = (minutes + ":" + seconds);

                    time = _timelineGroup.getAt((i * 3));

                    time.text = realTime;
                }
            }

            console.log((_timelineGroup.getAt(3 + ((_timeIterations) * 3) - 3).x + _timelineGroup.x) + " > " + _endOfTimeline)

            // Control visibility of passing timeline indicators
            if (_timelineGroup.getAt(3 + ((_timeIterations) * 3) - 3).x + _timelineGroup.x > _endOfTimeline)
                _timelineGroup.getAt(3 + ((_timeIterations) * 3) - 3).visible = false;
            else if (!_timelineGroup.getAt(3 + ((_timeIterations) * 3) - 3).visible)
                _timelineGroup.getAt(3 + ((_timeIterations) * 3) - 3).visible = true;

            if (_timelineGroup.getAt(3 + ((_timeIterations) * 3) - 2).x + _timelineGroup.x > _endOfTimeline)
                _timelineGroup.getAt(3 + ((_timeIterations) * 3) - 2).visible = false;
            else if (!_timelineGroup.getAt(3 + ((_timeIterations) * 3) - 2).visible)
                _timelineGroup.getAt(3 + ((_timeIterations) * 3) - 2).visible = true;

            if (_timelineGroup.getAt(3 + ((_timeIterations) * 3) - 1).x + _timelineGroup.x > _endOfTimeline)
                _timelineGroup.getAt(3 + ((_timeIterations) * 3) - 1).visible = false;
            else if (!_timelineGroup.getAt(3 + ((_timeIterations) * 3) - 1).visible)
                _timelineGroup.getAt(3 + ((_timeIterations) * 3) - 1).visible = true;









        // If timeline moved within movable area
        } else if (_timelineDrag.x < __gameWidth - 349) {


            // Update gray timeline bar location
            _timeline.x = _timelineDrag.x;


            // Set current time
            this.currentTimeText.setText(realTime);









        // If timeline dragged maximum right, start scrolling
        } else if (_timelineDrag.x >= __gameWidth - 349) {


            // Move time/line group
            _timelineGroup.x -= 3;


            // Set the current time
            this.currentTimeText.setText(realTime);


            // If scrolled past the width of a 30 second time block, reset lineGroup position and change times to align
            if (_timelineGroup.x <= -90) {

                this.funCount++;
                this.mineralText.text = this.funCount.toString();

                _timelineGroup.x = 0;

                this.timeLandmarks++;

                _timeLandmarks = this.timeLandmarks;

                // Update time texts
                for (i = 0; i < _timeIterations * 3; i++) {

                    timeValue = (i + _timeLandmarks - 1) * 30;
                    minutes = Math.floor(timeValue / 60).toString();
                    seconds = this.pad((timeValue % 60), 2);
                    realTime = (minutes + ":" + seconds);

                    time = _timelineGroup.getAt((i * 3));

                    time.text = realTime;
                }
            }

            // Control visibility of passing timeline indicators
            if (_timelineGroup.getAt(3 + ((_timeIterations) * 3) - 3).x + _timelineGroup.x >= _endOfTimeline)
                _timelineGroup.getAt(3 + ((_timeIterations) * 3) - 3).visible = false;
            else if (!_timelineGroup.getAt(3 + ((_timeIterations) * 3) - 3).visible)
                _timelineGroup.getAt(3 + ((_timeIterations) * 3) - 3).visible = true;

            if (_timelineGroup.getAt(3 + ((_timeIterations) * 3) - 2).x + _timelineGroup.x >= _endOfTimeline)
                _timelineGroup.getAt(3 + ((_timeIterations) * 3) - 2).visible = false;
            else if (!_timelineGroup.getAt(3 + ((_timeIterations) * 3) - 2).visible)
                _timelineGroup.getAt(3 + ((_timeIterations) * 3) - 2).visible = true;

            if (_timelineGroup.getAt(3 + ((_timeIterations) * 3) - 1).x + _timelineGroup.x >= _endOfTimeline)
                _timelineGroup.getAt(3 + ((_timeIterations) * 3) - 1).visible = false;
            else if (!_timelineGroup.getAt(3 + ((_timeIterations) * 3) - 1).visible)
                _timelineGroup.getAt(3 + ((_timeIterations) * 3) - 1).visible = true;
        }
    },

    stopTimeline: function(line) {

        if (line.x >= this.game.width - 349)
            line.x = this.game.width - 350;
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

    _scrollBar: function() {

        var scrollValue;

        this.isScrolling = !(this.isScrolling);

        if (!this.isScrolling)
            return;

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
        this.unitGroupUI.y = 74;

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