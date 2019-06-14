# Appium Raspberry Pi Driver

This is an [Appium](https://github.com/appium/appium) driver for the Raspberry PI GPIO header. It is currently not integrated as a first-party driver in the Appium server, but it can be run in standalone mode. For GPIO interaction it relies on [Johnny Five](http://johnny-five.io/) and the [raspi-io](https://github.com/nebrius/raspi-io) IO plugin for it.

## Installation

We assume you have a raspi with some version of linux installed which can handle this server and its dependencies. On the raspi, ensure Node.js and NPM are installed, then clone this repo somewhere. Inside the repo, run:

```
npm install
```

## Running the server

Since the server requires GPIO access, sudo should be used to start it:

```
sudo node .
```

If you're trying to access the server from outside the raspi somewhere, you might need to update the host so it's accessible from elsewhere on your network, for example:

```
sudo node . --host raspberrypi.local
```

## Desired capabilities

Only one capability is supported: `app`. The `app` capability should be a JSON object mapping GPIO pins to element names, pin modes, and initial states. Here's an example `app` value:

```js
{
  pins: {
    'P1-7': { id: 'A1', mode: 'output', init: 1, },
    'P1-11': { id: 'A2', mode: 'output', init: 1, },
    'P1-13': { id: 'A5', mode: 'output', init: 1, },
    'P1-15': { id: 'A6', mode: 'output', init: 1, },
  }
}
```

With this app structure, if I find element `A1`, and interact with it, I will be interacting with pin `P1-7`. Pin names are the same as [those supported by raspi-io](https://github.com/nebrius/raspi-io/wiki/Pin-Information). Acceptable values for `mode` are `input` and `output`. Acceptable values for `init` are `1` (initial state of high), and `0` (initial state of low).

## Supported Appium/Webdriver protocol commands

Only 4 commands in the extensive Webdriver spec are available in this driver:

* New Session (simply pass in the `app` capability with a value as described above). This will set up access to the board and set the pin modes and initial states.
* Quit Session. This will reset pins to their initial state.
* Find Element. Only finding single elements by ID is supported. How do you know what ID to use? You specify it in the `app` capability mapping! Example: `driver.findElementById("A1")`.
* Send Keys to Element. There are only two accepted values for this command: the strings `"0"` and `"1"`. `"0"` indicates that the pin should be set to low, whereas `"1"` indicates it should be set to high. Example: `element.sendKeys("0")`.

## Sample projects

Examples of this project in use:

* [@jlipps](https://github.com/jlipps)'s [AppiumConf 2019 demo](https://github.com/jlipps/appiumconf2019), which uses this driver to automate a homebrew drum machine built with a Circuit Playground.

## TODO

* There's quite a robust API available with Johnny Five. We could support more element types than just pins, for example LEDs, etc...
* We could automate other aspects of the Raspberry Pi beyond the GPIO header. Could even expose a full-on shell execution command (though it would be obtuse to use Appium for this rather than say `ssh` in most contexts).
