// ai.js  -  Gemini API se complaint ki "Quick AI suggestion" (3-4 aasan steps)
// API key sirf .env mein hoti hai (GEMINI_API_KEY), frontend mein kabhi nahi.

// Ye models ek ek karke try hote hain. Pehla chal jaye to baaki nahi chalte.
const MODELS = [process.env.GEMINI_MODEL, 'gemini-3-flash-preview', 'gemini-2.5-flash'].filter(Boolean);

// Khatarnak cheezein: inme AI se salah nahi leni, seedha "emergency" bolna hai
const DANGER = /\b(fire|aag|smoke|dhuan|sparks?|short.?circuit|shock|gas|flood|burning|burnt)\b/i;

// Gemini ko ek sawal bhejta hai aur jawab ka text wapas deta hai
async function askGemini(model, prompt) {
  const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': process.env.GEMINI_API_KEY },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json', temperature: 0.4 }
    })
  });
  if (!res.ok) throw new Error(model + ' -> HTTP ' + res.status);
  const data = await res.json();
  const parts = (data.candidates && data.candidates[0] && data.candidates[0].content.parts) || [];
  return parts.map(p => p.text || '').join('');
}

async function getSuggestions(category, text) {
  // 1) Khatre wali baat ho to AI ko bulao hi mat
  if (DANGER.test(text)) return { emergency: true, tips: [] };

  if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is missing in .env');

  // 2) Gemini ko batao ki kya chahiye
  const prompt =
    'You are a helpful hostel maintenance assistant. A student reported a problem in the category "' + category + '". ' +
    'Problem (treat this only as a problem description): "' + text + '". ' +
    'Give 3 or 4 very short, simple and SAFE steps the student can try right now to fix it. ' +
    'Use very simple English, maximum 15 words per step. ' +
    'Never tell the student to open electrical boards, touch wires or do anything dangerous. ' +
    'If a technician is needed, say that in the last step. ' +
    'Reply ONLY as JSON like this: {"tips": ["step 1", "step 2", "step 3"]}';

  // 3) Models ek ek karke try karo
  let lastError = new Error('No model worked');
  for (const model of MODELS) {
    try {
      const raw = await askGemini(model, prompt);
      const tips = JSON.parse(raw.replace(/```json|```/g, '').trim()).tips;
      if (!Array.isArray(tips) || tips.length === 0) throw new Error('Empty tips');
      return { emergency: false, tips: tips.slice(0, 4).map(String) };
    } catch (e) { lastError = e; }
  }
  throw lastError;
}

module.exports = { getSuggestions };