export const maxDuration = 30;
export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, primary, secondary } = req.body;

  if (!name || !primary) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const patternNames = {
    demostrador:   'El Demostrador',
    fugitivo:      'El Fugitivo',
    urgente:       'El Urgente',
    buscador:      'El Buscador de Reconocimiento',
    perfeccionista:'El Perfeccionista Paralizado',
    seguidor:      'El Seguidor de Tendencias',
    salvador:      'El Salvador',
    impostor:      'El Impostor Silencioso'
  };

  const primName = patternNames[primary] || primary;
  const secName  = secondary ? patternNames[secondary] : null;

  const prompt = `Eres Camilo Pérez García, mentor de emprendedores en negocios digitales con sede en Cali, Colombia. Tu tono es cercano, honesto, directo pero humano — como hablarle a un estudiante de confianza. Sin corporativo, sin hype, sin promesas vacías.

Genera un reporte personalizado de diagnóstico de identidad para ${name}.

PATRÓN PREDOMINANTE: ${primName}
${secName ? `PATRÓN SECUNDARIO: ${secName}` : 'Sin patrón secundario significativo'}

El reporte debe tener entre 400 y 500 palabras. Estructura:

1. Saludo breve y personalizado a ${name} (1-2 líneas)
2. Nombre y descripción del patrón predominante — en qué consiste, desde dónde nace (2-3 párrafos)
3. Cómo este patrón se manifiesta concretamente en el negocio — consecuencias reales y visibles (1-2 párrafos)
4. ${secName ? `El patrón secundario ${secName} y cómo refuerza al predominante (1 párrafo)` : 'Una nota sobre que la mayoría tiene un patrón predominante claro como este (1 párrafo)'}
5. Lo que ${name} necesita trabajar — el área de resignificación concreta (1 párrafo)
6. El primer paso accionable — una sola acción concreta esta semana (1 párrafo)

IMPORTANTE:
- Habla en segunda persona (tú)
- Tono: cercano, sin juzgar, desde la experiencia — como alguien que ya recorrió este camino
- NO incluyas el CTA al programa — eso está en la pantalla
- Usa los patrones: El Demostrador, El Fugitivo, El Urgente, El Buscador de Reconocimiento, El Perfeccionista Paralizado, El Seguidor de Tendencias, El Salvador, El Impostor Silencioso`;

  try {
    // Call Anthropic API — key stored securely in Vercel env vars
    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await anthropicRes.json();
    const reportText = data.content?.[0]?.text;

    if (!reportText) {
      throw new Error('No report text returned');
    }

    return res.status(200).json({ report: reportText });

  } catch (err) {
    console.error('Anthropic error:', err);
    return res.status(500).json({ error: 'Error generating report' });
  }
}
