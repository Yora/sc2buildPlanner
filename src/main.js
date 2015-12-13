window.onload = function () {

    var width = window.innerWidth * window.devicePixelRatio;
    var height = window.innerHeight * window.devicePixelRatio;

    var desktopWidth = window.innerWidth;
    var desktopHeight = 640;//window.innerHeight;


    if (window.devicePixelRatio == 1)
        var game = new Phaser.Game(desktopWidth, desktopHeight, Phaser.WEB_GL, 'game');
        //var game = new Phaser.Game(960, 640, Phaser.WEB_GL, '');
    else
        //var game = new Phaser.Game(window.innerWidth, window.innerHeight, Phaser.WEB_GL, '');
        //var game = new Phaser.Game(width / (window.devicePixelRatio - 1), height / (window.devicePixelRatio - 1), Phaser.CANVAS, '');
        //var game = new Phaser.Game('100', '100', Phaser.AUTO, '', {});
        var game = new Phaser.Game(width / (window.devicePixelRatio - 1), height / (window.devicePixelRatio - 1), Phaser.WEB_GL, '');


    game.state.add('Boot', require('./states/Boot'));
    game.state.add('Preloader', require('./states/Preloader'));
    game.state.add('MainMenu', require('./states/MainMenu'));
    game.state.add('Main', require('./states/Main'));

    game.state.start('Boot');
};



