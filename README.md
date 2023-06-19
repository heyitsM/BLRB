# BLRB
Most artists have a personal site for a portfolio (or use sites such as DeviantArt, ArtStation, Pixiv etc.), and a separate site for networking/advertising (e.g.: Twitter, Instagram, etc.). There is no single site for artists to connect to other artists, advertise commissions, and easily be able to share their portfolio (or possibly resume) to potential employers.

BLRB will serve as a place for artists to display their portfolio, link personal websites, link other social media, search for work, and engage their community.

## About
This repository, as it exists, is Team 7's final product in Spring 2023 Object Oriented Software Engineeering (601.421) at Johns Hopkins University. This team consisted of [Aya Habbas](https://github.com/ahabbs20), [Emily Berger](https://github.com/heyitsM), [Erica Lopez-Haz](https://github.com/elopezhaz), [Miaya South](https://github.com/msouth-code) and [Udochukwu Nwosu](https://github.com/unwosu6).

This is a copy of the private repository that was used for the class. If you would like access to the repository that was worked on during the class, please contact me.

If you visit the website and it isn't working, it may be due to service pauses (database or hosting). If you find that happened, please contact me.

## Installing / Getting Started
please get the .env from the pinned message in Slack. (most recent comment in that thread. 

We've run into some issues running the database locally concerning prisma. On the deployed site everything should be functional. If there is an issue, copy the prisma schema from main and run [npx prisma generate] with that as your schema. Prisma has been troublesome this entire project for us so please be patient and reach out if anything occurs. 

```
# in one terminal
cd Backend
yarn install
npx prisma db pull
npx prisma generate
yarn start
```
```
# in another terminal
cd Frontend
yarn install
yarn dev
```
open the link which appears in the frontend terminal. This should take you to a home page. simply signup and use, or login if you already have made an account (likely, because of changes, your account may have been removed!)


to test the frontend:
```
yarn install
yarn test --silent
```

To also test for coverage
to test the frontend:
```
yarn install
yarn test --coverage --silent
```

to test the backend:
```
yarn install
yarn test 
```

To also test for coverage on the backend:
```
yarn install
yarn coverage
```

If you run all backend tests, the email tests will send the emails to mailtrap. IF the email tests begin to fail, or after running tests you notice that you are seeing errors at any step that involves email (sign up, commissions process) you may need to make a new mailtrap account and put that information in the .env. Here are further instructions for that: 
Email route file runs through mailtrap, but mailtrap inboxes have an upper limit of 50 emails. As such, we minimized the amount of emails sent. However, it does send around 15 emails every time the test suite runs. Because of this, if tests start failing or locally running the site, you begin to have errors, please do the following: go [here](https://mailtrap.io/home) to make an account, go to email testing > inbox > my inbox. Click the integrations drop down, and copy the user into the .env `EMAIL_DEV`, and the pass into the .env `EMAIL_DEV_SECRET`. Then, re-run.

## Developing
**Tools**
 - [Node.js](https://nodejs.org/en/download/)
 - [Yarn](https://classic.yarnpkg.com/lang/en/docs/install/#windows-stable)
 - [Mailtrap](https://mailtrap.io/home)
 - [Nodemailer](https://nodemailer.com/about/)
 ### External APIS
 - [Stripe API](https://stripe.com/docs/api)

**Database Info**
 - Postgres through [supabase](https://supabase.com/docs/guides/database/overview)
 
**Global Dependencies**
 - Your `.env` file should contain the information in the pinned comment of our slack channel (the comment made by Aya). 


**Getting Started**
 - To install packages:
```
yarn install
```

 - To ensure local database schema is updated:
 ```
 npx prisma db pull
 ```
 
 - To alter the database structure:
Make changes to the `prisma/schema.prisma` file to add new tables to the database. To save these changes,
```
npx prisma db push
```
- To make changes to columns within tables that affect relations or something similar, make changes to the `prisma/schema.prisma` and run
```
npx prisma migrate dev --name init
```

**Building and Releasing a New Version**

Render will automatically deploy upon commits to main. So, although it may appear that the "deploy" job failed, in actuality, it has really deployed. Prisma and supabase tend to be finicky on tests, so some may arbitrarily pass and fail.
