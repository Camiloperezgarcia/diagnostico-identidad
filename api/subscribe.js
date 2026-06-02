export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, patron } = req.body;

  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Invalid email' });
  }

  try {
    const mlRes = await fetch('https://connect.mailerlite.com/api/subscribers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.MAILERLITE_API_KEY}`
      },
      body: JSON.stringify({
        email: email,
        fields: {
          name: name,
          patron_identidad: patron
        },
        groups: [process.env.MAILERLITE_GROUP_ID]
      })
    });

    const data = await mlRes.json();
    return res.status(200).json({ success: true, data });

  } catch (err) {
    console.error('MailerLite error:', err);
    return res.status(500).json({ error: 'Subscription error' });
  }
}
