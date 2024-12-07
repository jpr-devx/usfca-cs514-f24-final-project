# usfca-cs514-f24-final-project
Fullstack web application for CS514's final project (taught by Dr. David Wolber at the University of San Francisco)

## Project Proposal

<p>
  <strong>Background</strong>:<br>
  OpenAI’s language models offer a powerful platform for creating intelligent assistants. However, the lack of accessible tools for non-technical users and beginning developers to interact with and customize these assistants poses a barrier to adoption. This project aims to bridge that gap by building a user-friendly web application that simplifies assistant creation, customization, and usage.  
</p>
<hr>
<p>
  <strong>Objective</strong>:<br>
  Develop a full-stack web application that enables users to (i) create and customize OpenAI assistants without programming, (ii) upload documents for assistants to use as contextual knowledge, (iii) interact with assistants through intuitive conversation threads and (iv) manage multiple assistants and their configurations in a centralized interface.
</p>
<hr>
<strong>Overview</strong>:<br>
<p>
  <strong>Frontend</strong>: React will be used to create the interface with workflows allowing the user to sign in, create OpenAI assistants if they choose to do so, and select from a list of existing ones. The ability for the user to modify the creativity of the assistant will also be integrated. The front end will include a workflow enabling the user to upload local files to the application for the assistant to use as context in a tailored conversation.
</p>

<p>
  <strong>Backend</strong>: <br>
  Java Spring will be used to provide server-side logic to map user requests to API calls for OpenAI integration. The backend will include methods to process document uploads and incorporate their content into assistants, ensuring they have access to those files for conversation. 
</p>
<p>
  <strong>Database</strong>: <br>
  Google Cloud’s built-in datastore tools will be used to store data programmed in Java Spring for persistent storage. The database schema will be designed to store assistants, chats (threads on OpenAI’s end) each assistant has been used in, messages tied to each chat, and the user that each thread is tied to.
</p>
<hr>
<p>
  <strong>User-Sign-On & Authentication</strong>: <br>
  Firebase will be used to authenticate users signing in to the app. Google Sign-in will be used as the authentication method, eliminating the need for manual account creation and ensuring an efficient and secure sign-in and authentication process
  The application will be deployed using Google Cloud’s App Engine, allowing users to access the web application through their web browser. This project will democratize access to AI-powered tools by simplifying the creation and use of OpenAI assistants, empowering non-technical users to harness AI effectively.
</p>
<hr>
<p>
    <strong>How to run/deploy</strong>: <br>
    To deploy the project, clone the github project and start the frontend with npm start and the backend with running the AIAssistantApplication.java file. A valid OpenAI API key must be added as an environment variable prior to running the backend. Contained in the backend branch is a Docker file that can also be used to create a container that can be run as well. For the frontend, a valid firebase project with a cloud firestore must be active and its config be placed in a firebase.js config file in the frontend project for the front end to successfully run. The API url must be changed to match your own url as well. 
</p>
<hr>
<p>
  <strong>Individual Contributions</strong>: <br>
  John - Developed foundation of server-side Java OpenAI API calls for OpenAI assistant creation, modification and access, message creation and thread execution for obtaining assistant responses for conversation with document context. <br>
  Josh - Worked on developing the service and controller components for our backend. Worked with Postman to test and debug service and controller difficulties.<br>
  Alex - Coded the React components with Tailwind CSS for other developers to use. Helped Josh with some backend Java Spring logics. <br>
  Tom - Developed the frontend UI with a fun 1990s/2000s vibe to make users feel like they’ve stepped back into the early days of the internet. Added retro-style buttons, chat features, and alerts that all work smoothly with the backend functions and components. Also set up user authentication so everything runs securely and ties together nicely.. <br>
</p>
