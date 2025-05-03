//verify if admin
export const verifyAdmin = async (req, res) => {
  try {
    const user = await auth.getUser(req.user.uid);
    res.json({ isAdmin: user.customClaims?.admin || false });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};