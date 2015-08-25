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