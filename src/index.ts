import express, { Request, Response } from 'express';
import { Server } from 'socket.io';
import http from 'http';
import cors from 'cors';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',  // Allow any origin
  },
});

app.use(cors());
app.use(express.json());

interface Poll {
  question: string;
  options: string[];
  responses: Record<string, string>; 
}

let activePoll: Poll | null = null;
let studentsAnswered = new Set<string>(); 

app.get('/', (req: Request, res: Response) => {
  res.send('Polling system is running');
});

// Route to create a new poll (Teacher)
app.post('/create-poll', (req: Request, res: Response) => {
  console.log('Poll creation request received');
  const { question, options } = req.body;

  // If there's an active poll, close it before creating a new one
  if (activePoll) {
    io.emit('poll-closed', activePoll);
  }

  activePoll = {
    question,
    options,
    responses: {},
  };

  io.emit('new-poll', activePoll);
  res.status(200).json({ message: 'Poll created successfully' });
});

// WebSocket for students to submit answers
io.on('connection', (socket) => {
  console.log('A user connected', socket.id);

  // Send the active poll to a newly connected student
  if (activePoll) {
    console.log('Emitting active poll to newly connected student:', activePoll);
    socket.emit('new-poll', activePoll);
  }

  socket.on('request-poll', () => {
    if (activePoll) {
      socket.emit('new-poll', activePoll);
    }
  });

  // Handle answer submission by a student
  socket.on('submit-answer', (data: { studentId: string, selectedOption: string }) => {
    if (activePoll) {
      const { studentId, selectedOption } = data;

      // Save student's response
      activePoll.responses[studentId] = selectedOption;

      // Emit updated poll results
      io.emit('poll-results', activePoll.responses);
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('A user disconnected', socket.id);
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
