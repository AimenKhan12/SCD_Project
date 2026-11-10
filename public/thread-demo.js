// Multithreading ka SIMPLE DEMO (database ki zaroorat nahi). Chalane ke liye: node thread-demo.js
// Lab jaisa: 2 threads ek saath chalte hain, har ek sleep ke saath countdown karta hai.
const { Worker, isMainThread, workerData, threadId } = require('worker_threads');

if (isMainThread) {
  // ----- MAIN THREAD -----
  console.log('Main thread: shuru');
  const t1 = new Worker(__filename, { workerData: 'Thread-1' });   // new Thread("Thread-1")
  const t2 = new Worker(__filename, { workerData: 'Thread-2' });   // new Thread("Thread-2")
  t1.on('exit', () => console.log('Thread-1 is Dead (khatam)'));
  t2.on('exit', () => console.log('Thread-2 is Dead (khatam)'));
  console.log('Main thread: dono threads start ho gaye, main apna kaam kar raha hoon...');
} else {
  // ----- WORKER THREAD (Java ka run() method) -----
  let i = 4;
  const timer = setInterval(() => {
    console.log(workerData + ' (thread id ' + threadId + ') count: ' + i);
    i--;
    if (i === 0) { clearInterval(timer); console.log(workerData + ' exiting.'); }
  }, 500);                                                          // 500ms = Thread.sleep(500)
}