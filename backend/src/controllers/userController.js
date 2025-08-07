const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getUserByUid = async (req, res) => {
  const { uid } = req.params;
  console.log("🔎 Fetching DB user for UID:", uid);
  
  try {
    const user = await prisma.user.findUnique({
      where: { firebase_uid: uid },
      select: {
        id: true,
        firebase_uid: true,
        name: true,
        email: true,
        role: true,
        photo_url: true,
        createdAt: true,
        bio: true,
        dob: true
      }
    });

    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('❌ Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user', detail: error.message });
  }
};


exports.addUser = async (req, res) => {
  let { firebase_uid, email, role, name, photo_url, bio = '', dob = null } = req.body;
  // role = formatToEnum(role);

  console.log("Received user data from frontend:", req.body);

  try {
    const user = await prisma.user.upsert({
      where: { firebase_uid },
      update: { email, role, name, photo_url, bio, dob },
      create: { firebase_uid, email, role, name, photo_url, bio, dob }
    });

    res.status(201).json({ created: true });
  } catch (error) {
    console.error('Error adding user:', error);
    res.status(400).json({ detail: error.message });
  }
};

exports.checkRole = async (req, res) => {
  const { email, role } = req.body;

  try {
    const users = await prisma.user.findMany();
    const user = await prisma.user.findFirst({
      where: {
        email
      }
    });
    if (user) {
      res.status(200).json({});
    } else {
      res.status(400).json({ detail: 'Invalid role or email' });
    }
  } catch (error) {
    console.error('Error checking role:', error);
    res.status(400).json({ detail: error.message });
  }
};