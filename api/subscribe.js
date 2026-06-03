export const maxDuration = 30;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, patron, report } = req.body;

  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Invalid email' });
  }

  try {
    // 1. Register subscriber in MailerLite group
    await fetch('https://connect.mailerlite.com/api/subscribers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.MAILERLITE_API_KEY}`
      },
      body: JSON.stringify({
        email: email,
        fields: { name: name, patron_identidad: patron },
        groups: [process.env.MAILERLITE_GROUP_ID]
      })
    });

    // 2. Send transactional email with full report
    if (report) {
      const reportHtml = report
        .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
        .replace(/^# (.+)$/gm,'<h2 style="font-family:Georgia,serif;font-size:18px;font-weight:700;color:#1A1A2E;margin:20px 0 8px">$1</h2>')
        .replace(/^## (.+)$/gm,'<h3 style="font-family:Georgia,serif;font-size:16px;font-weight:700;color:#B8922A;margin:16px 0 6px">$1</h3>')
        .replace(/^### (.+)$/gm,'<h4 style="font-size:15px;font-weight:700;color:#1A1A2E;margin:14px 0 4px">$1</h4>')
        .replace(/\*\*(.+?)\*\*/g,'<strong style="color:#1A1A2E;font-weight:700">$1</strong>')
        .replace(/^---$/gm,'<hr style="border:none;border-top:1px solid rgba(201,168,76,0.3);margin:16px 0">')
        .replace(/\n\n/g,'</p><p style="margin:0 0 12px;line-height:1.8;color:#2A2A3E">')
        .replace(/\n/g,'<br>');

      const emailHtml = `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F5F0E8;font-family:Georgia,serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F0E8">
<tr><td align="center" style="padding:32px 16px">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%">

  <!-- HEADER -->
  <tr><td style="background:#1A1A2E;padding:24px 32px;border-radius:12px 12px 0 0;text-align:center">
    <p style="margin:0;font-family:Georgia,serif;font-size:20px;font-weight:700;color:#C9A84C;letter-spacing:0.02em">Camilo Pérez García</p>
  </td></tr>

  <!-- TOP BAR -->
  <tr><td style="height:3px;background:linear-gradient(90deg,#C9A84C,transparent)"></td></tr>

  <!-- INTRO -->
  <tr><td style="background:#FFFFFF;padding:32px 40px">
    <p style="margin:0 0 16px;font-size:16px;color:#1A1A2E;line-height:1.7">Hola <strong>${name}</strong>,</p>
    <p style="margin:0 0 16px;font-size:15px;color:#2A2A3E;line-height:1.8">Aquí está tu reporte completo de diagnóstico de identidad. Lo que encontraste no es un defecto — es el punto de partida más honesto que puedes tener como emprendedor.</p>
  </td></tr>

  <!-- PATRON BADGE -->
  <tr><td style="background:#1A1A2E;padding:20px 40px">
    <p style="margin:0 0 4px;font-size:10px;font-weight:700;color:#C9A84C;letter-spacing:0.15em;text-transform:uppercase">Patrón predominante</p>
    <p style="margin:0;font-size:22px;font-weight:700;color:#FFFFFF">${patron}</p>
  </td></tr>

  <!-- REPORT CONTENT -->
  <tr><td style="background:#FFFFFF;padding:32px 40px">
    <p style="margin:0 0 12px;line-height:1.8;color:#2A2A3E">${reportHtml}</p>
  </td></tr>

  <!-- VIDEO CTA -->
  <tr><td style="background:#F5F0E8;padding:28px 40px;text-align:center">
    <p style="margin:0 0 16px;font-size:15px;color:#2A2A3E;line-height:1.7">En este video te explico con más detalle qué significa tu patrón, desde dónde nace y cómo empieza a cambiar.</p>
    <a href="${process.env.VIDEO_URL || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'}" style="display:inline-block;background:#C9A84C;color:#1A1A2E;font-size:15px;font-weight:700;text-decoration:none;padding:14px 28px;border-radius:8px">▶ Ver el video — ¿Desde dónde estás emprendiendo?</a>
  </td></tr>

  <!-- MENTORIA CTA -->
  <tr><td style="background:#1A1A2E;padding:28px 40px">
    <p style="margin:0 0 12px;font-size:15px;color:rgba(245,240,232,0.8);line-height:1.7">¿Quieres ir más profundo? El trabajo de resignificar tu patrón de identidad es exactamente lo que hacemos en <strong style="color:#FFFFFF">Estructura que Expande</strong>.</p>
    <p style="margin:0;font-size:16px;font-weight:700;color:#FFFFFF">Escríbeme <span style="color:#C9A84C">MENTORIA</span> en un DM en Instagram</p>
  </td></tr>

  <!-- FOOTER -->
  <tr><td style="background:#1A1A2E;padding:20px 40px;border-radius:0 0 12px 12px;border-top:1px solid rgba(255,255,255,0.08)">
    <p style="margin:0;font-size:12px;color:rgba(245,240,232,0.4);text-align:center">© Camilo Pérez García · @camiloperezgarcia · camilo@miimperiodigital.com</p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;

      await fetch('https://connect.mailerlite.com/api/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.MAILERLITE_API_KEY}`
        },
        body: JSON.stringify({
          from: 'camilo@miimperiodigital.com',
          from_name: 'Camilo Pérez García',
          to: [{ email: email, name: name }],
          subject: `Tu reporte de identidad — ${patron}`,
          html: emailHtml
        })
      });
    }

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error('Subscribe error:', err);
    return res.status(500).json({ error: 'Error' });
  }
}
