import type { ChatMessage } from '@/types';

const PREDEFINED_RESPONSES = {
  greeting: [
    "Hello! I'm your medical research assistant specialized in hormonal data. What type of study are you working on?",
    "Welcome. I'm here to help you define exactly what hormonal data you need for your research. Could you tell me about your study?"
  ],
  age_range: [
    "I understand. What age range are you interested in for the participants?",
    "Perfect. What is the age range you need for your sample?"
  ],
  contraceptives: [
    "Are you specifically interested in women who use or don't use hormonal contraceptives?",
    "Do you need to differentiate by type of hormonal contraceptive (pill, IUD, implant)?"
  ],
  hormones: [
    "What specific hormonal markers are relevant for your study? For example: progesterone, estrogen, testosterone, FSH, LH...",
    "Are there specific hormones you need to analyze? I can filter by various hormonal markers."
  ],
  sample_size: [
    "What sample size are you looking for?",
    "How many participants do you need approximately for your research?"
  ],
  conditions: [
    "Are you interested in specific hormonal conditions like PCOS (polycystic ovary syndrome) or endometriosis?",
    "Do you need data from women with particular hormonal conditions?"
  ],
  ready_report: [
    "Perfect, I understand your needs clearly. Based on the criteria you mentioned, I can generate a personalized report with aggregated and anonymized data. Would you like me to proceed with the report generation? This will cost 1 BIOCHAIN.",
    "Excellent. Based on what you told me, I can create a report with real data from our platform, completely anonymized. Shall I proceed with generation? Cost: 1 BIOCHAIN."
  ],
  affirmative: [
    "Great! Give me a moment while I compile the data that matches your criteria...",
    "Perfect, starting to generate your personalized report..."
  ]
};

const KEYWORDS = {
  greeting: ['hola', 'hello', 'buenas', 'ayuda', 'comenzar', 'empezar', 'hi', 'hey', 'start'],
  age: ['edad', 'años', 'age', 'rango etario', 'jóvenes', 'adultas', 'años de edad', 'years old', 'range'],
  contraceptives: ['anticonceptivo', 'pildora', 'píldora', 'diu', 'implante', 'hormonal', 'contraceptive', 'anticonceptivos', 'birth control', 'iud', 'pill'],
  hormones: ['hormona', 'progesterona', 'estrogeno', 'estrógeno', 'testosterona', 'hormone', 'marcador', 'fsh', 'lh', 'estrogen', 'progesterone', 'testosterone', 'marker'],
  sample: ['muestra', 'participantes', 'cantidad', 'numero', 'número', 'sample', 'cuantas', 'cuántas', 'tamaño', 'participants', 'women', 'subjects', 'size'],
  conditions: ['condicion', 'condición', 'enfermedad', 'sop', 'endometriosis', 'condition', 'poliquístico', 'pcos', 'disease', 'disorder'],
  affirmative: ['sí', 'si', 'yes', 'dale', 'adelante', 'procede', 'genera', 'ok', 'okay', 'sure', 'proceed', 'generate'],
};

function matchKeywords(text: string, keywords: string[]): boolean {
  const lowerText = text.toLowerCase();
  return keywords.some(keyword => lowerText.includes(keyword.toLowerCase()));
}

function randomFrom<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

export function generateAIResponse(messages: ChatMessage[]): string {
  const lastMessage = messages[messages.length - 1].content.toLowerCase();

  // Detect affirmative responses to generate report
  if (matchKeywords(lastMessage, KEYWORDS.affirmative) && messages.length > 3) {
    return randomFrom(PREDEFINED_RESPONSES.affirmative);
  }

  // Detect intention based on keywords
  if (matchKeywords(lastMessage, KEYWORDS.greeting) || messages.length === 1) {
    return randomFrom(PREDEFINED_RESPONSES.greeting);
  }

  if (matchKeywords(lastMessage, KEYWORDS.age)) {
    return randomFrom(PREDEFINED_RESPONSES.age_range);
  }

  if (matchKeywords(lastMessage, KEYWORDS.contraceptives)) {
    return randomFrom(PREDEFINED_RESPONSES.contraceptives);
  }

  if (matchKeywords(lastMessage, KEYWORDS.hormones)) {
    return randomFrom(PREDEFINED_RESPONSES.hormones);
  }

  if (matchKeywords(lastMessage, KEYWORDS.sample)) {
    return randomFrom(PREDEFINED_RESPONSES.sample_size);
  }

  if (matchKeywords(lastMessage, KEYWORDS.conditions)) {
    return randomFrom(PREDEFINED_RESPONSES.conditions);
  }

  // If several criteria have been mentioned, offer to generate report
  if (messages.length >= 4) {
    return randomFrom(PREDEFINED_RESPONSES.ready_report);
  }

  // Generic response
  const genericResponses = [
    "Interesting. Could you give me more details about the specific criteria you need?",
    "I understand. Are there any other important requirements for your research?",
    "Perfect. What else do you need me to consider for your study?",
    "Are there specific demographic or medical characteristics I should take into account?"
  ];

  return randomFrom(genericResponses);
}

export function shouldOfferReport(messages: ChatMessage[]): boolean {
  // Offer to generate report if there is enough context
  const userMessages = messages.filter(m => m.role === 'user');
  return userMessages.length >= 3;
}

export function shouldGenerateReport(lastMessage: string): boolean {
  return matchKeywords(lastMessage, KEYWORDS.affirmative);
}

export function extractQueryFromMessages(messages: ChatMessage[]): string {
  // Extract a summary query from user messages
  const userMessages = messages
    .filter(m => m.role === 'user')
    .map(m => m.content)
    .join(' ');

  return userMessages.substring(0, 500); // Limit size
}
