import express from 'express';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

const UserRouter = express.Router();

// Initialize Firebase Client App


initializeApp(JSON.parse(process.env.firebaseConfig));

// Login Route
UserRouter.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if(email==="pakistan-autos@gmail.com"){
  try {
    // Sign in the user with email and password using Firebase Client Auth
    const userCredential = await signInWithEmailAndPassword(getAuth(), email, password);
    
    // Get the user's ID token
    const idToken = await userCredential.user.getIdToken();
    
    // Set token and role in response headers
    res.setHeader('Authorization', `${idToken}`);
    res.setHeader('User-Role', 'admin'); // Hardcoded role as admin

    return res.status(200).json({
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(401).json({
      message: 'Invalid email or password',
      error: error.message,
    });
  }}else{
    return res.status(403).json({
      message:"Invalid Credentials",
    });
  }
});


UserRouter.post('/login2', async (req, res) => {
  const { email, password } = req.body;
if(email==="manager@pakistan-autos.com"){
  try {
    // Sign in the user with email and password using Firebase Client Auth
    const userCredential = await signInWithEmailAndPassword(getAuth(), email, password);
    
    // Get the user's ID token
    const idToken = await userCredential.user.getIdToken();
    
    // Set token and role in response headers
    res.setHeader('Authorization', `${idToken}`);
    res.setHeader('User-Role', 'manager'); // Hardcoded role as manager

    return res.status(200).json({
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(401).json({
      message: 'Invalid email or password',
      error: error.message,
    });
  }}else{
    return res.status(403).json({
      message:"Invalid Credentials",
      
    })
  }
});

export default UserRouter;