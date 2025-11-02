const SAMPLE_MATCHES = [
  '1912 French 1 Franc',
  '1957 Italian 100 Lire',
  '1969 German 5 Mark',
  '1901 US Morgan Dollar'
];

function toSeed(input) {
  return Array.from(input ?? '')
    .map((char) => char.charCodeAt(0))
    .reduce((acc, value) => acc + value, 0);
}

function createRandom(seed) {
  let value = seed || 1;
  return () => {
    value = (value * 1664525 + 1013904223) % 4294967296;
    return value / 4294967296;
  };
}

export function recognizeCurrency({ filename = '', mime_type = '' }) {
  const seed = toSeed(filename + mime_type) || 42;
  const random = createRandom(seed);

  const index = Math.floor(random() * SAMPLE_MATCHES.length);
  const probable_match = SAMPLE_MATCHES[index];
  const confidence = Number((0.4 + random() * 0.5).toFixed(4));
  const notes = 'Prototype vision placeholder. Integrate ML or external service for production.';

  return { probable_match, confidence, notes };
}
