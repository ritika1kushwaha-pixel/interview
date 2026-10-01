import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

function geminiInterviewApiPlugin(): Plugin {
  return {
    name: 'gemini-interview-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/interview/')) {
          return next();
        }

        const apiKey = process.env.GEMINI_API_KEY;
        const ai = apiKey
          ? new GoogleGenAI({
              apiKey,
              httpOptions: {
                headers: {
                  'User-Agent': 'aistudio-build',
                },
              },
            })
          : null;

        // Parse JSON body
        const buffers: Buffer[] = [];
        for await (const chunk of req) {
          buffers.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
        }
        const bodyStr = Buffer.concat(buffers).toString('utf-8');
        let body: any = {};
        if (bodyStr) {
          try {
            body = JSON.parse(bodyStr);
          } catch {
            // body parse error
          }
        }

        res.setHeader('Content-Type', 'application/json');

        // ROUTE 1: Generate Questions
        if (req.url === '/api/interview/generate-questions' && req.method === 'POST') {
          const { domain, role, seniority, difficulty, interviewType, count = 3 } = body;

          if (!ai) {
            res.statusCode = 200;
            res.end(JSON.stringify({ useFallback: true, message: 'Gemini client running in local mode' }));
            return;
          }

          try {
            const prompt = `You are an elite principal interviewer conducting an interview for:
Role: ${role}
Field/Domain: ${domain}
Seniority Level: ${seniority}
Difficulty: ${difficulty}
Interview Style: ${interviewType}

Generate exactly ${count} highly realistic, challenging, and authentic mock interview questions tailored to this role and seniority.
For each question, provide:
1. questionText: The actual question an interviewer at a top company would ask.
2. category: The competency or topic being evaluated.
3. hintSTAR: A guide showing how to structure a winning answer (situation, task, action, result).
4. modelAnswer: An exemplary benchmark response that would earn an immediate hire decision.`;

            const response = await ai.models.generateContent({
              model: 'gemini-3.8-flash',
              contents: prompt,
              config: {
                responseMimeType: 'application/json',
                responseSchema: {
                  type: Type.OBJECT,
                  properties: {
                    questions: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          questionText: { type: Type.STRING },
                          category: { type: Type.STRING },
                          hintSTAR: {
                            type: Type.OBJECT,
                            properties: {
                              situation: { type: Type.STRING },
                              task: { type: Type.STRING },
                              action: { type: Type.STRING },
                              result: { type: Type.STRING },
                            },
                            required: ['situation', 'task', 'action', 'result'],
                          },
                          modelAnswer: { type: Type.STRING },
                        },
                        required: ['questionText', 'category', 'hintSTAR', 'modelAnswer'],
                      },
                    },
                  },
                  required: ['questions'],
                },
              },
            });

            const parsed = JSON.parse(response.text || '{}');
            res.statusCode = 200;
            res.end(JSON.stringify(parsed));
          } catch (err: any) {
            console.error('Error generating questions with Gemini:', err);
            res.statusCode = 200;
            res.end(JSON.stringify({ useFallback: true, error: err.message }));
          }
          return;
        }

        // ROUTE 2: Evaluate Answer
        if (req.url === '/api/interview/evaluate-answer' && req.method === 'POST') {
          const { questionText, category, userAnswer, seniority, role, difficulty } = body;

          if (!ai) {
            res.statusCode = 200;
            res.end(JSON.stringify({ useFallback: true, message: 'Gemini client running in local mode' }));
            return;
          }

          try {
            const prompt = `You are a world-class executive talent evaluator and senior hiring bar-raiser.
Interview Context:
- Role: ${role} (${seniority} level)
- Difficulty: ${difficulty}
- Competency: ${category}

The Question asked:
"${questionText}"

Candidate's Answer:
"${userAnswer}"

Evaluate this answer rigorously with high precision across:
1. Technical Knowledge & Correctness (depth, accuracy of principles, edge cases, domain rigor)
2. Communication & Structure (STAR alignment, clarity, conciseness, absence of filler, logical flow)
3. Confidence & Strategic Impact (ownership, quantifiable business outcome, executive presence)

Provide:
- technicalScore (0-100 integer)
- communicationScore (0-100 integer)
- confidenceScore (0-100 integer)
- overallScore (0-100 integer)
- strengths (array of 2-4 distinct bullet points describing what the candidate nailed)
- improvements (array of 2-3 specific, actionable recommendations on what was missed or how to elevate)
- modelAnswer (an exemplary 10/10 response showing how a top-tier candidate would answer this)
- followUpQuestion (a sharp follow-up probing question testing edge cases or deeper depth)
- summaryFeedback (a concise 2-sentence executive summary verdict)`;

            const response = await ai.models.generateContent({
              model: 'gemini-3.8-flash',
              contents: prompt,
              config: {
                responseMimeType: 'application/json',
                responseSchema: {
                  type: Type.OBJECT,
                  properties: {
                    technicalScore: { type: Type.INTEGER },
                    communicationScore: { type: Type.INTEGER },
                    confidenceScore: { type: Type.INTEGER },
                    overallScore: { type: Type.INTEGER },
                    strengths: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                    improvements: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                    modelAnswer: { type: Type.STRING },
                    followUpQuestion: { type: Type.STRING },
                    summaryFeedback: { type: Type.STRING },
                  },
                  required: [
                    'technicalScore',
                    'communicationScore',
                    'confidenceScore',
                    'overallScore',
                    'strengths',
                    'improvements',
                    'modelAnswer',
                    'followUpQuestion',
                    'summaryFeedback',
                  ],
                },
              },
            });

            const parsed = JSON.parse(response.text || '{}');
            res.statusCode = 200;
            res.end(JSON.stringify(parsed));
          } catch (err: any) {
            console.error('Error evaluating answer with Gemini:', err);
            res.statusCode = 200;
            res.end(JSON.stringify({ useFallback: true, error: err.message }));
          }
          return;
        }

        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), geminiInterviewApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

