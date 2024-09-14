interface Poll {
    question: string;
    options: string[];
    timeLimit: number;
  }
  
  let currentPoll: Poll | null = null;
  let studentsAnswered = new Set<string>();
  let pollResults: { [question: string]: { [answer: string]: number } } = {};
  
  export const createPoll = (question: string): Poll | null => {
    if (!currentPoll) {
      currentPoll = { question, options: [], timeLimit: 60 };
      pollResults[question] = {};
      studentsAnswered.clear(); // Reset for new poll
      console.log('Poll created:', question);
    }
    return currentPoll;
  };
  
  export const submitAnswer = (studentId: string, answer: string): { [answer: string]: number } | null => {
    if (currentPoll && !studentsAnswered.has(studentId)) {
      studentsAnswered.add(studentId);
      if (!pollResults[currentPoll.question][answer]) {
        pollResults[currentPoll.question][answer] = 0;
      }
      pollResults[currentPoll.question][answer] += 1;
      console.log('Answer received:', studentId, answer);
      return pollResults[currentPoll.question];
    }
    return null;
  };
  
  export const closePoll = (): { [answer: string]: number } | null => {
    if (currentPoll) {
      const results = pollResults[currentPoll.question];
      currentPoll = null; // Reset current poll
      return results;
    }
    return null;
  };
  