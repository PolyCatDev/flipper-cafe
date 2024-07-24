// qFlipper installation script for Linux
// By PolyCat

let dialog = require("dialog");
let badusb = require("badusb");
let notify = require("notification"); // Remove this if you made Flipper scilent

badusb.setup({
    vid: 0xAAAA,
    pid: 0xBBBB,
    mfr_name: "Flipper Devices",
    prod_name: "Flipper Zero",
    layout_path: "/ext/badusb/assets/layouts/en-US.kl",
});

print("Waiting for connection");
while (!badusb.isConnected()) {
    delay(1000);
}

dialog.message("Focus ur terminal?", "Press OK to continue");

print("Executing payload");
badusb.println("wget https://update.flipperzero.one/builds/qFlipper/1.3.3/qFlipper-x86_64-1.3.3.AppImage && chmod +x ./qFlipper-x86_64-1.3.3.AppImage && ./qFlipper-x86_64-1.3.3.AppImage rules install");

let launch_qflip = dialog.message("Download done?", "Press OK to launch qFlipper");

if (launch_qflip) {
    badusb.println("./qFlipper-x86_64-1.3.3.AppImage");
}

notify.success(); // Remove this to make flipper scilent on finish
