# PLUGH.js - Text Adventure Game Engine Documentation

## Overview
PLUGH.js is a lightweight text adventure game engine that provides an interactive command-line interface for creating and playing text-based adventure games in the browser. It handles room and object management, user input processing, and game state tracking.

## Core Concepts
- **Rooms**: Locations in the game world, containing descriptions and objects.
- **Objects**: Interactive items in the game that can be examined, picked up, or used.
- **Player**: The entity controlled by the user, with an inventory system.
- **Commands**: Text-based inputs parsed into actions.
- **Game State**: Persistent variables tracking progress and conditions.

## Initialization
To initialize the game engine, create an instance of `PLUGH`:
```js
game = new PLUGH("#game-container");
game.init();
```
This will attach the game interface to the specified DOM element and set up the command-line interface.

## Rooms
Rooms represent locations in the game world. When a room is loaded, the player will be greeted with the room's ``intro`` property, and they will then be able to freely interact with any GameObjects in the room. Subsequently, if a player queries ``look around``, the intro property will be echoed, along with a list of objects in the room.
```js
const room1 = new Room("forest", "Dark Forest", {
    desc: "A dark and mysterious forest.",
    intro: "You step into the eerie darkness of the forest.",
    objects:[]
});
```
### Leave property
Rooms may specify a ``leave`` attribute. This is a reference (either by name, object, or ID) to another room. If this property is specified, a player may say 'leave room' and will be sent to the specified room.

### Managing Rooms
- **Add a Room**:
  ```js
  game.addRoom(room1);
  ```
- **Load a Room**:
  ```js
  game.loadRoom("forest");
  ```
- **Get the Current Room**:
  ```js
  game.getCurrentRoom();
  ```

## Objects
Everything that a player might interact with in the world is considered a GameObject. A statue in the center of the room, a key, a door--all of these are represented in the engine as GameObjects. GameObjects store a collection of properties which the user can interact with. If a user types, for example, "look at torch," the game will check the room for an object named 'torch' and, if it finds one, return the 'sight' response for that GameObject.

### Properties

The complete list of properties is as follows:
```
['touch', 'taste', 'sight', 'pee', 'sleep', 'smell', 'hear', 'read', 'attack', 'shoot', 'talk', 'sex', 'smoke', 'use', 'open', 'enter', 'take', 'turn', 'give', 'drop', 'move', 'search', 'close', 'fill', 'cast', 'light', 'toss', 'knock', 'turnoff', 'extinguish']
```

A user may perform any of these actions on a GameObject, and the game will return an appropriate response, if it is defined for that GameObject. The value for these properties may be a String, in which case text will be echoed to the console, or a Function, in which case the function will be executed.

```js
const torch = new GameObject("torch", "a flickering torch", {
    sight: "The torch casts a warm glow.",
    aliases: ['lantern', 'light'],
    take: function() {
        game.player.inventory.addItem(this);
        return "You pick up the torch.";
    }
});
```
### Aliases
The worst moments in a text adventure are when a player needs to guess exactly how to refer to an object. We alleviate some of this pain by adding ``aliases`` to an object. In the case of the above object, the player refer to the torch by either 'torch,' or any of the objects aliases, including 'lantern' and 'light.'

### Hidden objects
To hide an object from the "look around" object list, leave the ``proper name`` attribute (the second argument in the GameObject constructor function) blank. The player will still be able to interact with the object using its aliases and name, but it will not appear when the player types "look around."

### Managing Objects
- **Add an Object to a Room**:
  ```js
  room1.addObject(torch);
  ```
- **Retrieve an Object in a room**:
  ```js
  const obj = room1.getObject("torch");
  ```
- **Remove an object from a room**:
  ```js
  room1.removeObject(torch)
  ```

## Player
The player object tracks inventory and game state.
```js
const player = game.player;
player.inventory.addItem(torch);
```
### Inventory Management
GameObjects can be added/removed from a player's inventory, which will make them accessible to the player in any room. You can create new objects to be added to the inventory at any time (ie, an NPC gives the player a key), or, you can add existing items in a room to the player's inventory (ie, the player picks up a rock off the ground). Note that when adding an item from a room, you will need to manually remove the object from the room after it has been added to the player's inventory. Vice versa, if the player can drop an item, you will need to manually add it to the room.

- **Add Item**:
  ```js
  player.inventory.addItem(torch);
  ```
- **Remove Item**:
  ```js
  player.inventory.removeItem(torch);
  ```
- **Check Item**:
  ```js
  const hasTorch = player.inventory.getItem("torch");
  ```

## Commands and Input Handling
The engine supports text input for interacting with objects and navigating the world.
```js
game.commandLine.echo("Welcome to the adventure!");
```
### Handling User Input
- **Echo Output**:
  ```js
  game.echo("You see a dark cave ahead.");
  ```
- **Show Choices**:
  ```js
  game.showChoice([
    ["Enter the cave", () => game.loadRoom("cave")],
    ["Walk away", () => game.echo("You decide not to enter.")]
  ]);
  ```

## Game State Management
PLUGH.js tracks game state with flags.
```js
game.gameState("torchLit", true);
console.log(game.gameState("torchLit")); // true
```

## Saving and Loading
To save the game state:
```js
game.save();
```
This outputs a Base64-encoded string that can be stored and restored later.

## Credits
PLUGH.js was created by Ben Ehrlich, with further contributions by the open source community. The game jam game Desrosier’s Discovery, for which this engine was created, was written by Ben Ehrlich and Isabel Stewart. The documentation for this game was created with the assistance of ChatGPT (sorry).
