// API route for users
export default function handler(req, res) {
  if (req.method === 'GET') {
    // Handle GET request
    res.status(200).json({ message: 'Users API endpoint' });
  } else if (req.method === 'POST') {
    // Handle POST request
    res.status(200).json({ message: 'User created' });
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}