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
  <strong>Individual Contributions</strong>: <br>
  John - <br>
  Josh - <br>
  Alex - <br>
  Tom - Developed the frontend UI with a nostalgic 1990s/2000s theme, designed to immerse users in the aesthetics of the early internet era. This included crafting vintage-style buttons, chat interfaces, and alert systems, all seamlessly integrated with backend functionality and components. Additionally, implemented user authentication mechanisms to ensure secure access, creating a cohesive and interactive experience that bridges frontend design with backend operations. <br>
</p>
