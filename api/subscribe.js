export const maxDuration = 30;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, patron, report } = req.body;

  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Invalid email' });
  }

  const VIDEO_URL = process.env.VIDEO_URL || 'https://www.youtube.com/watch?v=o8TrXzqypiw&t=240s';
  const VIDEO_THUMBNAIL = `https://img.youtube.com/vi/o8TrXzqypiw/maxresdefault.jpg`;

  try {
    // 1. Register subscriber in MailerLite group (no automation email — handled by transactional below)
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
        .replace(/^## (.+)$/gm,'<h3 style="font-family:Georgia,serif;font-size:16px;font-weight:700;color:#C9A84C;margin:16px 0 6px">$1</h3>')
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
  <tr><td style="height:3px;background:linear-gradient(90deg,#C9A84C,transparent)"></td></tr>

  <!-- 1. BIENVENIDA -->
  <tr><td style="background:#FFFFFF;padding:36px 40px 24px">
    <p style="margin:0 0 16px;font-size:16px;color:#1A1A2E;line-height:1.7">Hola <strong>${name}</strong>,</p>
    <p style="margin:0 0 14px;font-size:15px;color:#2A2A3E;line-height:1.8">Completaste tu diagnóstico de identidad. Lo que acabas de descubrir no es un defecto — es el punto de partida más honesto que puedes tener como emprendedor.</p>
    <p style="margin:0 0 14px;font-size:15px;color:#2A2A3E;line-height:1.8">Antes de leer tu reporte, te pido que veas el video que está justo abajo. En él explico qué significa cada patrón de identidad, desde dónde nace y por qué reconocerlo cambia todo. Con ese contexto, tu reporte va a tener mucho más sentido.</p>
    <p style="margin:0;font-size:15px;color:#2A2A3E;line-height:1.8"><strong style="color:#1A1A2E">Tómate 20 minutos para verlo antes de seguir.</strong> Vale la pena.</p>
  </td></tr>

  <!-- 2. VIDEO THUMBNAIL -->
  <tr><td style="background:#FFFFFF;padding:0 40px 36px;text-align:center">
    <a href="${VIDEO_URL}" style="display:block;text-decoration:none;position:relative">
      <div style="position:relative;border-radius:10px;overflow:hidden;border:2px solid rgba(201,168,76,0.4)">
        <img src="${VIDEO_THUMBNAIL}" alt="Ver video — Las identidades del emprendedor" width="520" style="width:100%;max-width:520px;display:block;border-radius:8px">
        <!-- Play button overlay -->
        <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:64px;height:64px;background:rgba(201,168,76,0.92);border-radius:50%;display:flex;align-items:center;justify-content:center">
          <div style="width:0;height:0;border-top:14px solid transparent;border-bottom:14px solid transparent;border-left:22px solid #1A1A2E;margin-left:4px"></div>
        </div>
      </div>
      <p style="margin:12px 0 0;font-size:13px;color:#C9A84C;font-weight:700;letter-spacing:0.04em">▶ Ver video — Las identidades del emprendedor</p>
    </a>
  </td></tr>

  <!-- DIVIDER -->
  <tr><td style="background:#F5F0E8;padding:20px 40px;text-align:center">
    <p style="margin:0;font-size:13px;color:#2A2A3E;font-style:italic">¿Ya lo viste? Ahora sí — aquí está tu reporte.</p>
  </td></tr>

  <!-- 3. PATRON BADGE -->
  <tr><td style="background:#1A1A2E;padding:20px 40px">
    <p style="margin:0 0 4px;font-size:10px;font-weight:700;color:#C9A84C;letter-spacing:0.15em;text-transform:uppercase">Tu patrón predominante</p>
    <p style="margin:0;font-size:24px;font-weight:700;color:#FFFFFF">${patron}</p>
  </td></tr>

  <!-- 4. REPORTE -->
  <tr><td style="background:#FFFFFF;padding:32px 40px">
    <p style="margin:0 0 12px;line-height:1.8;color:#2A2A3E">${reportHtml}</p>
  </td></tr>

  <!-- 5. CTA FOLLOW ME -->
  <tr><td style="background:#F5F0E8;padding:32px 40px;text-align:center">
    <p style="margin:0 0 6px;font-size:13px;font-weight:700;color:#1A1A2E;letter-spacing:0.08em;text-transform:uppercase">Sígueme para más contenido</p>
    <p style="margin:0 0 20px;font-size:14px;color:#2A2A3E;line-height:1.7">Cada semana comparto herramientas, reflexiones y estrategias para construir tu negocio desde quien realmente eres.</p>
    <a href="https://www.instagram.com/camiloperezgarcia" style="display:inline-block;background:#1A1A2E;color:#C9A84C;font-size:14px;font-weight:700;text-decoration:none;padding:13px 28px;border-radius:8px;letter-spacing:0.03em">Seguir en Instagram → @camiloperezgarcia</a>
  </td></tr>

  <!-- 6. MENTORIA CTA -->
  <tr><td style="background:#1A1A2E;padding:28px 40px">
    <p style="margin:0 0 10px;font-size:15px;color:rgba(245,240,232,0.85);line-height:1.7">¿Quieres ir más profundo? El trabajo de resignificar tu patrón de identidad es exactamente lo que hacemos en <strong style="color:#FFFFFF">Estructura que Expande</strong>, mi programa de mentoría para emprendedores digitales.</p>
    <p style="margin:0;font-size:16px;font-weight:700;color:#FFFFFF">Escríbeme <span style="color:#C9A84C">MENTORÍA</span> en un DM en Instagram</p>
  </td></tr>

  <!-- FOOTER -->
  <tr><td style="background:#1A1A2E;padding:20px 40px;border-radius:0 0 12px 12px;border-top:1px solid rgba(255,255,255,0.08)">
    <p style="margin:0;font-size:12px;color:rgba(245,240,232,0.35);text-align:center">© Camilo Pérez García · @camiloperezgarcia · camilo@miimperiodigital.com</p>
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
          subject: `${name}, tu diagnóstico de identidad está aquí`,
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
