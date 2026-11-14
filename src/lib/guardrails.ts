// German and English crisis trigger keywords for immediate safety routing
const CRISIS_KEYWORDS = [
  'selbstmord',
  'suizid',
  'umbringen',
  'nicht mehr leben',
  'leben beenden',
  'sterben will',
  'keinen sinn mehr',
  'ritzen',
  'selbstverletzung',
  'suicide',
  'kill myself',
  'end my life',
  'want to die',
  'harm myself',
  'cut myself'
];

export interface GuardrailResult {
  isCrisis: boolean;
  crisisMessage?: string;
  sentimentScore: number;
}

export function evaluateGuardrails(text: string): GuardrailResult {
  const lower = text.toLowerCase();
  
  const isCrisis = CRISIS_KEYWORDS.some(keyword => lower.includes(keyword));

  // Basic sentiment estimation (-1.0 to 1.0)
  let sentiment = 0.0;
  const negativeWords = ['schlecht', 'angst', 'panik', 'hoffnungslos', 'traurig', 'weinen', 'allein', 'einsam', 'müde', 'überfordert', 'sad', 'scared', 'hopeless', 'lonely'];
  const positiveWords = ['gut', 'besser', 'erleichtert', 'ruhig', 'geschafft', 'dankbar', 'hoffnung', 'freude', 'better', 'calm', 'hopeful', 'relieved'];

  negativeWords.forEach(w => {
    if (lower.includes(w)) sentiment -= 0.2;
  });
  positiveWords.forEach(w => {
    if (lower.includes(w)) sentiment += 0.2;
  });
  sentiment = Math.max(-1.0, Math.min(1.0, sentiment));

  if (isCrisis) {
    return {
      isCrisis: true,
      sentimentScore: -0.9,
      crisisMessage: `⚠️ WICHTIGER HINWEIS: Es scheint, dass es Ihnen im Moment sehr schlecht geht. Bitte denken Sie daran, dass Sie nicht alleine sind. 

Für sofortige kostenfreie und vertrauliche Unterstützung erreichen Sie rund um die Uhr:
• TelefonSeelsorge: 0800 111 0 111 oder 0800 111 0 222
• Bundesweiter Notruf: 112
• Info-Telefon Depression: 0800 33 44 533

Ich bin als digitaler Begleiter für Sie da, kann jedoch keine Krisenintervention oder medizinische Behandlung ersetzen.`
    };
  }

  return {
    isCrisis: false,
    sentimentScore: sentiment,
  };
}
