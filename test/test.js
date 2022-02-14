const BusyLight = require('../dist/busylight').BusyLight;

let busylight = null;

const open = () => {
    console.log('-----------------------------------------');
    console.log();
    const devices = BusyLight.devices();
    if (devices.length === 0) {
        console.log('No devices found');
        return;
    }
    const selected = devices[0];

    console.log('Selected', selected);

    busylight = new BusyLight(selected);
    busylight.connect();
};


const testProgram = () => {
    if (!busylight) return;

    console.log();
    console.log('Red and Green blink test (7sec)');
    busylight.program([
        {
            cmd: 'jump',
            cmdv: 1,
            repeat: 3,
            red: 0x05,
            green: 0x00,
            blue: 0x00,
            on: 0x0A,
            off: 0x0A,
            audio: true,
            tone: -1,
            volume: 0
        },
        {
            cmd: 'jump',
            cmdv: 2,
            repeat: 3,
            red: 0x00,
            green: 0x05,
            blue: 0x00,
            on: 0x0A,
            off: 0x0A,
            audio: true,
            tone: -1,
            volume: 0
        }
    ]);
    console.log();
    console.log(busylight.state());
    console.log();

    setTimeout(() => {
        busylight.disconnect();
    }, 7000);
};

const testSound = () => {
    if (!busylight) return;

    console.log();
    console.log('Purple sound test (45sec)');

    let count = 0;
    const int = setInterval(() => {
        if (count > 15) {
            busylight.disconnect();
            clearInterval(int);
            return;
        }
        console.log('Sound test ' + count);
        busylight.program([
            {
                cmd: 'jump',
                cmdv: 0,
                repeat: 0,
                red: 0x05,
                green: 0x00,
                blue: 0x05,
                on: 0x00,
                off: 0x00,
                audio: true,
                tone: count,
                volume: 1
            }
        ]);
        console.log();
        console.log(busylight.state());
        console.log();
        count = count + 1;
    }, 3000);
};

const testLight = () => {
    if (!busylight) return;

    console.log();
    console.log('Light test (15sec)');

    busylight.light('ff0000');
    setTimeout(() => {
        busylight.light('ffff00');
        setTimeout(() => {
            busylight.light('ffffff');
            setTimeout(() => {
                busylight.light('00ffff');
                setTimeout(() => {
                    busylight.light('0000ff');
                    setTimeout(() => {
                        busylight.disconnect();
                    }, 3000);
                }, 3000);
            }, 3000);
        }, 3000);
    }, 3000);
};

const testTone = () => {
    if (!busylight) return;

    console.log();
    console.log('Light test (15sec)');

    busylight.tone(1, 1);
    setTimeout(() => {
        busylight.tone(2, 2);
        setTimeout(() => {
            busylight.tone(3, 3);
            setTimeout(() => {
                busylight.tone(4, 4);
                setTimeout(() => {
                    busylight.tone(5, 5);
                    setTimeout(() => {
                        busylight.disconnect();
                    }, 3000);
                }, 3000);
            }, 3000);
        }, 3000);
    }, 3000);
};

const testToneWithLight = () => {
    if (!busylight) return;

    console.log();
    console.log('Light test (15sec)');

    busylight.tone(1, 1);
    setTimeout(() => {
        busylight.light('ffff00');
        setTimeout(() => {
            busylight.light('ffffff');
            setTimeout(() => {
                busylight.tone(5, 1);
                setTimeout(() => {
                    busylight.light('0000ff');
                    setTimeout(() => {
                        busylight.disconnect();
                    }, 3000);
                }, 3000);
            }, 3000);
        }, 3000);
    }, 3000);
};

open();

//testProgram();

//testSound();

//testLight();

//testTone();

testToneWithLight();
