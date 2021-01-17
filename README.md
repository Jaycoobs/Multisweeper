## Multisweeper

It's multiplayer minesweeper in the browser.

Create a room and share the URL with your friends to play together.

I made this for a specific group of people so it contains
some mild profanity.... I'd probably rate it T.

### Setup

This project requires nodejs.

Clone this repo anywhere, use `npm install` to install the dependencies,
then use `node index.js` to run the project.

In order for this to work, everyone needs access to the HTTP server.
I've been acheiving this by simply forwarding a port from my router to
my PC and running the project there.

If you're going to set this up in a more sophisticated system, you need
to make sure that there is no caching on at least HTTP connections with 
`Content-Type: text/event-stream` otherwise the game will be unresponsive.
