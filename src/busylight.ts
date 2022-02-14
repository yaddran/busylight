import * as HID from 'node-hid';


interface BusyLightDevice {
    vendorId: number;
    productId: number;
    path: string;
    serialNumber: string;
    manufacturer: string;
    product: string;
    release: number;
    interface: number;
    usagePage: number;
    usage: number;
}

type BusyLightDevices = Array<BusyLightDevice>;

interface BusyLightStep {
    cmd: string;
    cmdv: number;
    repeat: number;
    red: number;
    green: number;
    blue: number;
    on: number;
    off: number;
    audio: boolean;
    tone: number;
    volume: number;
}

type BusyLightSteps = Array<BusyLightStep>;

/**
 * Main class for busylight.
 *
 * @class
 * @public
 */
class BusyLight {
    private static KEEPALIVE_SEC = 5;
    private static STEPS_COUNT = 7;
    private static VENDORID = 0x27BB;
    private static PRODUCTS = [0x3BCA, 0x3BCB, 0x3BCC, 0x3BCD];

    private static CMDS = {
        keepalive:  0x80,
        bootloader: 0x40,
        reset:      0x20,
        jump:       0x10
    };

    private static KEEPALIVE: Array<number> = [
        0x8F, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0xFF, 0xFF, 0xFF, 0xFF, 0x00, 0x00
    ];

    private static OFF: Array<number> = [
        0x10, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x80,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0xFF, 0xFF, 0xFF, 0xFF, 0x00, 0x00
    ];



    public static devices(): BusyLightDevices {
        const ds = HID.devices();
        const result: BusyLightDevices = [];
        if (!Array.isArray(ds)) return [];
        ds.forEach((d) => {
            if (d.vendorId !== this.VENDORID) return;
            if (this.PRODUCTS.indexOf(d.productId) < 0) return;
            result.push(d as BusyLightDevice);
        });
        return result;
    }

    private _device: BusyLightDevice = null;
    private _hid: any = null;
    private _keepalive: any = null;
    private _steps: Array<number> = BusyLight.OFF.concat([]);

    private _r: number = 0;
    private _g: number = 0;
    private _b: number = 0;
    private _tone: number = -1;
    private _volume: number = -1;

    constructor(device: BusyLightDevice) {
        if (!device) return;
        this._device = device;
    }

    private _connect(): void {
        try {
            this._hid = new HID.HID(this._device.path);
            this._send(this._steps);
        } catch (ignore) {
            this._hid = null;
        }
    }

    private _keep_alive(): void {
        if (!this._device) return;
        if (!this._hid) return this._connect();
        this._send(BusyLight.KEEPALIVE);
    }

    private _checksumed(data: Array<number>): Array<number> {
        let cs = 0;
        data.forEach((v, i) => {
            if (i > 61) return;
            cs = cs + v;
        });
        data[62] = (cs >> 8) & 0xFF;
        data[63] = cs & 0xFF;
        return data;
    }

    private _send(data: Array<number>): void {
        if (!this._hid) return;
        try {
            this._hid.write(this._checksumed(data));
        } catch (ignore) {
            this._hid = null;
        }
    }

    public connect(): boolean {
        if (!this._device) return false;
        if (this._keepalive) return true;
        this._keepalive = setInterval(this._keep_alive.bind(this), BusyLight.KEEPALIVE_SEC * 1000);
        this._keep_alive();
        return true;
    }

    private _build_step(step: BusyLightStep, index: number): boolean {
        if (!step) return false;
        if (index >= BusyLight.STEPS_COUNT) return false;

        const si: number = index * 8;

        if (!BusyLight.CMDS[step.cmd]) return false;
        step.cmdv = step.cmdv & 0x0F;
        this._steps[si + 0] = BusyLight.CMDS[step.cmd] | step.cmdv;

        step.repeat = step.repeat & 0xFF;
        this._steps[si + 1] = step.repeat;

        step.red = step.red & 0xFF;
        this._steps[si + 2] = step.red;

        step.green = step.green & 0xFF;
        this._steps[si + 3] = step.green;

        step.blue = step.blue & 0xFF;
        this._steps[si + 4] = step.blue;

        step.on = step.on & 0xFF;
        this._steps[si + 5] = step.on;

        step.off = step.off & 0xFF;
        this._steps[si + 6] = step.off;

        this._steps[si + 7] = 0x00;
        if (!step.audio) return true;

        this._steps[si + 7] = 0x80;
        if (step.tone < 0) return true;
        if (step.volume <= 0) return true;

        step.tone = step.tone & 0x0F;
        step.volume = step.volume & 0x07;
        this._steps[si + 7] = 0x80 | (step.tone << 3) | step.volume;

        return true;
    }

    public state(): string {
        let s: string = '';
        let c: string;
        for (let i = 0; i < 8; i = i + 1) {
            for (let j = 0; j < 8; j = j + 1) {
                c = this._steps[i * 8 + j].toString(16);
                s = s + (c.length < 2 ? '0' : '') + c + ' ';
            }
            s = s + '\n';
        }
        return s;
    }

    private _build_steps(steps: BusyLightSteps): void {
        this._steps = BusyLight.OFF.concat([]);
        if (!Array.isArray(steps)) return;
        let step_index: number = 0;
        steps.forEach((step: BusyLightStep) => {
            if (!this._build_step(step, step_index)) return;
            step_index = step_index + 1;
        });
    }

    public program(steps: BusyLightSteps): void {
        this._send(BusyLight.OFF);
        this._build_steps(steps);
        this._send(this._steps);
    }

    public off(): void {
        this._steps = BusyLight.OFF.concat([]);
        this._send(this._steps);
    }

    public light(color: string): boolean {
        if (!color) return false;
        if (color.charAt(0) === '#') color = color.substring(1);
        if (color.length < 6) return false;
        const r: number = parseInt(color.substring(0, 2), 16);
        const g: number = parseInt(color.substring(2, 4), 16);
        const b: number = parseInt(color.substring(4, 6), 16);
        if (isNaN(r)) return false;
        if (isNaN(g)) return false;
        if (isNaN(b)) return false;
        this._r = r;
        this._g = g;
        this._b = b;
        this._build_steps([{
            cmd: 'jump',
            cmdv: 0,
            repeat: 0,
            red: this._r,
            green: this._g,
            blue: this._b,
            on: 0x00,
            off: 0x00,
            audio: true,
            tone: this._tone,
            volume: this._volume
        }]);
        this._send(this._steps);
        return true;
    }

    public tone(tone: number, volume: number): boolean {
        this._tone = tone;
        this._volume = volume;
        this._build_steps([{
            cmd: 'jump',
            cmdv: 0,
            repeat: 0,
            red: this._r,
            green: this._g,
            blue: this._b,
            on: 0x00,
            off: 0x00,
            audio: true,
            tone: -1,
            volume: -1
        }]);
        this._send(this._steps);
        this._build_steps([{
            cmd: 'jump',
            cmdv: 0,
            repeat: 0,
            red: this._r,
            green: this._g,
            blue: this._b,
            on: 0x00,
            off: 0x00,
            audio: true,
            tone: tone,
            volume: volume
        }]);
        this._send(this._steps);
        return true;
    }

    public disconnect(): void {
        if (this._keepalive) clearInterval(this._keepalive);
        this._keepalive = null;

        this._steps = BusyLight.OFF.concat([]);
        this._send(this._steps);
        if (this._hid) this._hid.close();
        this._hid = null;
    }

}

export { BusyLightDevice, BusyLightDevices, BusyLightStep, BusyLightSteps, BusyLight };
