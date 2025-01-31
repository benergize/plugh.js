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
Rooms represent locations in the game world.
```js
const room1 = new Room("forest", "Dark Forest", {
    desc: "A dark and mysterious forest.",
    intro: "You step into the eerie darkness of the forest."
});
```
### Managing Rooms
- **Add a Room**:
  ```js
  game.addRoom(room1);
  ```
- **Load a Room**:
  ```js
  game.loadRoom("forest");
  ```

## Objects
Game objects can be placed in rooms and interacted with.
```js
const torch = new GameObject("torch", "a flickering torch", {
    sight: "The torch casts a warm glow.",
    take: function() {
        game.player.inventory.addItem(this);
        return "You pick up the torch.";
    }
});
```
### Managing Objects
- **Add an Object to a Room**:
  ```js
  room1.addObject(torch);
  ```
- **Retrieve an Object**:
  ```js
  const obj = game.getObject("torch");
  ```

## Player
The player object tracks inventory and game state.
```js
const player = game.player;
player.inventory.addItem(torch);
```
### Inventory Management
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
