# Licence Informatique@UCA Discord Bot 🥳

<img src="https://usercontent.stantabcorp.com/~thibault/46d34e1eccb244ceabd468f3d597e853-logo-rond-l.png" align="right" alt="Licence Informatique@UCA Discord Bot" width="200" height="200">

Welcome to the "Licence Informatique@UCA" discord bot repo 🎉. This bot is primarily used on the "Licence Informatique@UCA" discord server. Which is the discord server for the bachelor in computer science at University Côte D'Azur (Nice, France).  

Feel free to fork this project change whatever you want 😉 And don't forget to open a pull request!

## Features

- Role management   
Use the `!picker` command to create a Role picker and let students select with subjects they are taking
- Channel management  
Use the `!cours` command to create a new category with: 
    1. An announcement channel
    2. A general text channel
    3. A general voice channel

    This command also creates a new Role to add to the role picker.

- Student management  
*This is a special feature what will only work for our University if you can implement a general verification system you are more than welcome*  
The command `!verification` lets you verify that a student is really who he claims, by asking his student id and checking it against the university's database.
- Moderation
The `!warn` command lets you give a warning to someone and the `!mute` allow you to mute them.
- Logging
The bot will record every activity made on the server such as:
    1. Messages sent
    2. Messages edited
    3. Nickname changes

- Cosmetics  
This bot will automatically change the server's icon and it's avatar every day at midnight. 

## How to run

1. Install dependencies with `npm i`
1. Copy the `.env.example` to `.env` and fill the appropriatre values
1. Run `uca.js` via `nodejs uca.js` (or pm2)

