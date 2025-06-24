import app from './index.js'

export default async (req, res) => {
  // Convert Supabase request to Express format
  const method = req.method;
  const url = req.url;
  const headers = req.headers;
  const body = req.body;
  
  // Mock Express request/response objects
  const expressReq = {
    method,
    url,
    headers,
    body,
    pipe: () => {},
    on: () => {}
  };

  const expressRes = {
    status: (code) => {
      res.status(code);
      return expressRes;
    },
    json: (data) => res.send(data),
    setHeader: (name, value) => res.setHeader(name, value),
    end: () => res.end()
  };

  // Handle request
  await app(expressReq, expressRes);
}

