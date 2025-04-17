# Front part of the PS8 project

This folder should contain all the static files that could be returned by the file server to clients.

By default, the HTTP server used in `services/files/logic.js` will start checking for files inside this repo.
This means that when a client targets `projectName.ps8.academy/folder1/file1.png`\*,
the HTTP server will try to find `file1.png` inside `front/folder1`.

You are free to change this behavior, and to manage the folders and files inside this project however you like,
but remember to update the `services/files/logic.js` file accordingly.

\*Note: At the start of the project, you don't have a `ps8.academy` URL, so you will have to use localhost.

## Front architecture

### Pages

There are five pages in eTron's front-end, three of which are very similar. We built something fairly akin to a single-page to avoid unnecessary page reloads:
- The Home page (aka [index.html](https://github.com/PolytechNS/ps8-25-etron/blob/report/services/files/front/index.html)), this is were most features are and to fit everything into this one page we used pop-up windows and a sliding side pannel to handle all social interactions.
- The three game pages, each gamemode (online 1v1, 1v1 against AI and local 1v1) has its own page and its own javascript logic. All three pages are pretty similar in design and in logic but they have their slight variations (online 1v1 has emotes, local 1v1 is played with keyboard rather than mouse/controller, local 1v1 does not communicate with the back-end, etc...)
- The password recovery page. This feature was added decently late in the development, so to avoid pop-up bloating the home page a little bit too much it was added in its own clean and brand new page.

### Components

Concerning components, we opted for a streamlined approach. Because we are talking about native Web Components and not a framework specialized in components we of course don't want to overuse them. So we only used components when there was a real benefit doing so and in our case that was when something was going to be used multiple times AND it had JavaScript logic attached, because CSS classes already exist to reuse design. Also we specifically avoided using `fetch` in said components to query separates CSS and HTML files, a technique apparently quite popular among our competitors that allows developpers to have, well, CSS and HTML in separate files for your component (just like you would with Angular for instance). But this technique also has the huge downside of fetching the same exact HTML and CSS files twenty-five times if you create twenty-five of the same component which obviously causes visible loading of the latters. This is why all of our components are simply JS files with HTML and CSS as strings, this way only one request ever happens.

That said, I am going to list a few noteworthy components:
- `gamegrid`, by far the biggest in terms of code complexity, typically this was one of the most obvious choices as to what should be coded as a component because it is used in three different pages, with the same style and it has a lot of JavaScript logic with it, because, as the name suggests, this is what takes care of drawing the hexagonal grid into a canvas. And as if that weren't already a hard enough task on its own it also has to expose (via attributes to mimic props from React) the coordinates of the current player in the grid (coordinates in pixels) and the offset of the canvas that lives in a shadow DOM in order to get the direction using the user's mouse cursor.
- `frienditem` which are the singular items of the user's friend list. They are created dynamically using JavaScript so this is simplified a lot by using Web Components. They also have a bunch of logic attached to take care of CSS animations, to display wether that friend is online or not, wether the user has unread messages from that friend and it also stores informations like the friend's id, name and ELO for display purposes and for future HTTP requests.
