# BusyLight Library for controlling busy light devices

This library can be used to control Busy Light devices (for instance in your electron js application or any other node js project).

Currently supported devices:
- Kuando / Plenom BusyLight Alpha (Vendor ID 0x27BB Product ID 0x3BCA)
- Kuando / Plenom BusyLight UC (Vendor ID 0x27BB Product ID 0x3BCB)
- Kuando / Plenom Kuando Box (Vendor ID 0x27BB Product ID 0x3BCC)
- Kuando / Plenom BusyLight Omega (Vendor ID 0x27BB Product ID 0x3BCD)
- Kuando / Plenom BusyLight Alpha 2 (Vendor ID 0x27BB Product ID 0x3BCE)
- Kuando / Plenom BusyLight Omega 2 (Vendor ID 0x27BB Product ID 0x3BCF)

Dependency: node-hid

## Install

```
npm install @pureit/busylight
```

## Usage

Get supported devices:
```
const BusyLight = require('@pureit/busylight').BusyLight;
const devices = BusyLight.devices();
```

Connect to a device:
```
const busylight = new BusyLight(devices[0]);
busylight.connect();
```

Check if device is one of the devices from the list:
```
is_the_device = busylight.is(devices[0]);
```

Get device response
```
response = busylight.response();
```

Turn all off:
```
busylight.off();
```

Turn on red light:
```
busylight.light('ff0000');
```

Set intesity for light (0-100):
```
busylight.intesity(50);
```

Sound tone 4 with volume 3:
```
busylight.tone(4, 3);
```

Sound tone 5 once with volume 1:
```
duration_ms = busylight.once(5, 1);
```

Blink blue color, 0.5 sec (5 * 0.1s) on and 0.2 sec (2 * 0.1s) off:
```
busylight.blink('#000044', 5, 2);
```

Pulse green color:
```
busylight.pulse('#004400');
```

Alert with tone 2, volume 1, blinking red 0.5 sec (5 * 0.1s) on and 0.3 sec (3 * 0.1s) off
```
busylight.alert(2, 1, '#ff0000', true, 5, 3);
```

Alert with tone 3, volume 1, pulsing red
```
busylight.alert(3, 1, '#ff0000', false);
```

Send a program:
- dimmed red light for 1s (0x0A x 0.1s), off for 2s (0x14 x 0.1s), stop tone, repeat 3 times and jump to step 1
- dimmed green light for 1s, off for 1 sec, tone 5 with volume 2, repeat 4 times and jump to step 0
```
    busylight.program([
        {
            cmd: 'jump',
            cmdv: 1,
            repeat: 3,
            red: 0x05,
            green: 0x00,
            blue: 0x00,
            on: 0x0A,
            off: 0x14,
            audio: true,
            tone: -1,
            volume: -1
        },
        {
            cmd: 'jump',
            cmdv: 0,
            repeat: 4,
            red: 0x00,
            green: 0x05,
            blue: 0x00,
            on: 0x0A,
            off: 0x0A,
            audio: true,
            tone: 5,
            volume: 2
        }
    ]);
```

## Coverage
We have been able to test this library with:
- Kuando / Plenom BusyLight Omega (Vendor ID 0x27BB. Product ID 0x3BCD)
- Kuando / Plenom BusyLight Omega (Vendor ID 0x27BB. Product ID 0x3BCF)
