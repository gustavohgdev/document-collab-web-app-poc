# Real-time Collaborative Document Editor

A real-time collaborative document editor built with Django and React. Users can create, edit, and collaborate on documents in real-time.

## Features

- Real-time document editing with WebSocket support
- User authentication and authorization
- Document sharing with different permission levels (VIEW, EDIT, ADMIN)
- Collaborative editing with multiple users
- Auto-saving and persistent storage

## Prerequisites

- Docker and Docker Compose
- Git

## Getting Started

1. Clone the repository:
```bash
git clone <repository-url>
cd <project-directory>

2. Execute command to run containers

```bash
docker compose up --build
```

3.  Access the application:

-   Frontend: [http://localhost:5173](http://localhost:5173)
-   Backend API: [http://localhost:8000](http://localhost:8000)
  
4. Missing features

There are 2 missing additional features that are not part of the app because of time constraints which are rich text editing and adding shapes. But here I'll mention the changes we'll need to implement in order to add these features:

Backend Changes Needed:

- Update the Document model's content field to handle rich text and shapes data
- Adjust the WebSocket consumer to handle different types of changes (text, shapes, formatting)
- Update serializers to handle the new data structures

Frontend Changes Needed:

- Integrate a rich text editor library (like TipTap or Slate.js)
- Add drawing/shapes functionality (using Canvas or SVG)
- Update WebSocket handling for different types of updates
- Update the UI to include formatting controls and shape tools

5. Screenshots and recordings

![alt text](<Screenshot 2024-12-14 at 3.02.51 AM.png>)

![alt text](<Screenshot 2024-12-14 at 3.03.21 AM.png>)

![alt text](<Screenshot 2024-12-14 at 3.03.48 AM.png>)

[text](<Screen Recording 2024-12-14 at 3.04.55 AM.mov>)