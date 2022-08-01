# Welcome to Jair BnB!

### This website is a pixel-perfect clone of Air BnB's website. I tweaked the title of the clone I create because my name is Jair (obviously)!

### Every spot listing that is available on this site is themed on Jair's passions/favorite things. You'll have the option to stay in a gaming house, cat cottage, dog house, and many other of Jair's favorite themed spots!


[Link to Jairbnb](https://jair-bnb.herokuapp.com/)

![alt text](./frontend/src/components/Navigation/images/Screen%20Shot%202022-08-01%20at%206.58.10%20AM.png)

# Technologies
## Front-End
- React
- Redux
- CSS

# Back-End
- Express.js
- Node.js
- Sequelize

#Instructions

1. Clone the repository
2. Run npm i in the root, backend, and frontend directories to install node dependencies
3. Create a .env in the backend directory following the example file
4. Run `npx dotenv sequelize db:migrate` and `npx dotenv sequelize db:seed:all` in the backend dir to initialise the db
5. Run `npm start` first in the backend, then the frontend directories. The app is available at `localhost:3000`.

# Challenges
Working with Redux and React for the first time was tricky. Keeping state up to date was not easy and I ran into many bugs that I'll look to avoid on my next project. Running into bugs when your app is on Heroku is always a blast 😛

# Improvements
1. Make the front end UI cleaner and add media queries so it can be viewed on different screen sizes.
2. Only use Redux as a last resort. I'd prefer if my app didn't need to send a request to my backend so much. I'd much rather use React Context if its the better tool.
3. Add more seeder data.
