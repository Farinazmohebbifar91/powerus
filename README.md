

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test
```


## My notes 

```bash
As the flight APIs are not stable and it can sometimes fail or reply after a couple of seconds,
I tried to implement a cache service that tries to fetch data from APIs and keep them on a sqlite 
database every 10 mins ( schedule time can be changed base on how the APIs fail or how long data 
from the endpoints remains valid).

I found an approach for implementing cache service and saving data in DB:

I added 'reading' and 'url' tables to keep history of fetching data from endpoints and for returning data to the client, only send latest valid data from each API. 
having 'url' table helps us to easily add other flight sources in the future.

** what is happening in cache service:
 - Fetch all urls from db which we need to collect data  
 - Call the API to get flights for each url
 - If fetching flight were successful, Add a row to reading table and save which time we fetched data
 - Add suggestions ( this table keep price and has an FK to readings) 
 - Add flights if they are not duplicates ( use existing flight and its Id if it is already in db)
 - Add fligh_slices to specify which flights are connected to which suggestion 
   (has FK to flight and suggestion)
   (I desinged entities flight,flight-suggestion,flight-slice base on what mentioned endpoints return
   and having scalability for future, for example having more than two slices for sugesstion)
 - At the end I set lastReadingId field to url table to address last updated data per url
 - I added another small function to remove oldData that are not valid anymore,it can be improve more



** flight controller
I added flight controller to be used in search page for the customers with get(localhost:3000/flight).
in these controller I fetch all valid data from sqlite, map it like what we recieved from mentioned 
endpoints and send it to the client. I check data to discard the ones that are older than 1 hour ago 
and not sending to client.

** flight service
I added flight services for our requests to DB and repository connections (we could have separate services for each meaningful repository but as it was a small project I kept all of them together)

** Database
If you wanna have look on DB you can check flightDB file on route path 
or maybe import it in a database tool to have an interface to interact with database

** For testing the flight controller and cache service and seeing the data after run the code 
you should wait 10 mins or you can change schedule time in cache service to have it sooner, 
then we first saving data in db you can expect to fetch data in controller.
I already added two rows in 'url' table and fill it with our sources in address field.

** About tests implementation: As I mentioned before I do not have experience writing tests,
but if it is necessary I can attend to the online course and learn it so fast. 
I do not think it be so difficult as I am so eager to gain experience about that.
for this project I just debugging and chaning the test to make it run


Feel free to write me 'farinazmohebbifar@gmail.com' if you face any issue around running the code 
or you had any questions.
```