# How to start the application
1. Clone the repository `https://github.com/nate-j5/finch-project`

## Start the Server
1. Run `cd server` - to navigate to the server directory  
2. Run `npm install` - to install the dependencies
3. Run `cp .env.example .env` - to copy the env.example file to a .env file and add the specified fields.
4. Run `npm run dev` - to start the development server
5. The server should start at `http://localhost:4000`

## Start the Client
1. Run `cd client` - to navigate to the client directory  
2. Run `npm install` - to install the dependencies
3. Run `npm start` - to start the development server
4. The server should start at `http://localhost:3000`


### Project Reflection
I enjoyed working on this project, but I struggled to understand the instructions. I think I switched contexts 3 or 4 times which cost me a lot of time. Next time I would allocate a solid block of time to understand the instructions and return my clarifying questions. This project coincided with a lot of activity in my current role.

My original interpretation was that I'd create a button that would open the Finch Connect and display employment data about a provider in my app based on user selection.  After attempting to implement this it didn't appear like this was the correct thinking which prompted me to re-think the solution. 

After reviewing the Finch quickstart tutorial, I shifted my attention to creating a button that when clicked would retrieve an access token based and then fetch data about an employer and employee. 

The "user selected provider" piece was not totally clear to me. At first, I attempted to call the `https://api.tryfinch.com/providers` endpoint to get the list of providers and render that list to the screen. However, that endpoint returns a lot of data so I ended up manually copying the provider list from Finch connect into a JSON file. I ran out of time, but the idea was to have the user select the provider from the dropdown and have that data rendered to the screen. 

Instead, my application requests an access token from the Finch API and returns dummy data with a list of employees. When an employee is clicked it displays their name and the company name.

### Key takeaways
- Finch's API documentation is well organized, and was pleasant to experiment with. 
- I struggled to understand the instructions. I wasn't sure if the instructions were intentionally obscure but in the future, I'd allocate my resources (time permitting) to clarify the instructions. 

### Project Strengths
- Able to connect to Finch and request and access token
- Renders the company and employee information to the UI
- Handles the access token in a securely on the backend through a session cookie. 

### Areas of Improvement
- Not all areas of the requirements are implemented. 
- The overall architecture of the app may not be close to what the activity intends. 
- I would use a different CSS implementation (not inline styles).


