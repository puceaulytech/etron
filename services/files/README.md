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

(notes: only add components when something is going to be used multiple times AND has javascript attached (because same design but no JS needed => CSS class), also fetching HTML and CSS = bad)
