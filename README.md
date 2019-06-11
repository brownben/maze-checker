<img src="http://worldorienteeringday.com/wp-content/uploads/2016/03/wod-logo-color.png" alt="World Orienteering Day Logo" height="150px"/>

# Maze Checker

Checks a Simple Maze Orienteering Course has been Completed Correctly and operates a simple leader board function

A simple program, based on electron, to read SportIdent cards to check the Maze Course was completed correctly and to calculate the time. Created for World Orienteering Day 2018, for more information about World Orienteering Day see https://worldorienteeringday.com

## Install
Get the Windows installer from Releases page

OR To build from source:

        git clone https://github.com/brownben/wod-maze.git
        npm install
        npm run styles
        npm start
To create your own executable then run:

        npm run dist

## Usage
Click 'Import Courses' in the left hand toolbar and select your courses file, this file should look like ./sample data/courses.json or below
````
{
        // "course-name":[list of control codes separated by a comma],
        "1":[101,102,103,104],
        "Long":[255,101,213,100,122]
}
````
Then select your station from the COM Port list and select the correct baud rate. 4800 for Serial and 38400 for USB.
Click 'Connect', then the course you want matched and dib into the station and check if you have got the course correct
Have fun!
Note: SI Card 6 don't work (Codes: 500000-999999)

## License
Released under a MIT License
See [LICENSE.md](./LICENSE.md)

## Credits
See [CREDITS.md](./CREDITS.md)

### WOD Maze Checker is not supported, associated or endorsed by [SportIdent](https://www.sportident.com), or [World Orienteering Day](https://worldorienteeringday.com) in any way

### The World Orienteering Day Logo used throughout this project is not owned by the creator or project
