import express from 'express';
import { db } from '../db.js'; // Assuming Firebase is initialized here
import { collection, addDoc, doc, getDocs, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';

const AgentRouter = express.Router();

// Function to validate input
const validateAgentInput = (data) => {
  const { agentName, contactNumber, address, identificationNumber } = data;
  if (!agentName || !contactNumber || !address || !identificationNumber) {
    return false;
  }
  return true;
};

// Add an Agent
AgentRouter.post('/add', async (req, res) => {
  try {
    const agentData = req.body;

    // Validate input
    if (!validateAgentInput(agentData)) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check for existing agent with the same identification number
    const agentsCollectionRef = collection(db, 'agents');
    const querySnapshot = await getDocs(agentsCollectionRef);
    const existingAgent = querySnapshot.docs.find(doc => doc.data().identificationNumber === agentData.identificationNumber);
    if (existingAgent) {
      return res.status(400).json({ error: 'An agent with this identification number already exists' });
    }


    const docref= await addDoc(agentsCollectionRef, agentData);
    // Fetch the newly added seller's data to include the ID
    const newAgentSnapshot = await getDoc(docref);
    const newAgent = { id: newAgentSnapshot.id, ...newAgentSnapshot.data() };

    // Respond with the new seller data
    res.status(201).json(newAgent);
    res.status(201).json({ message: 'Agent added successfully' });
  } catch (error) {
    console.error('Error adding agent:', error);
    res.status(500).json({ error: 'Error adding agent' });
  }
});

// Update an Agent
AgentRouter.put('/update/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const agentData = req.body;

    // Validate input
    if (!validateAgentInput(agentData)) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if the agent exists
    const agentRef = doc(db, 'agents', id);
    const agentSnapshot = await getDoc(agentRef);
    if (!agentSnapshot.exists()) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    // Check for existing agent with the same identification number (excluding current agent)
    const agentsCollectionRef = collection(db, 'agents');
    const querySnapshot = await getDocs(agentsCollectionRef);
    const existingAgent = querySnapshot.docs.find(
      (doc) => doc.data().identificationNumber === agentData.identificationNumber && doc.id !== id
    );
    if (existingAgent) {
      return res.status(400).json({ error: 'An agent with this identification number already exists' });
    }

    // Update agent document
    await updateDoc(agentRef, agentData);
    const updatedAgentSnapshot = await getDoc(agentRef);
    const updatedAgent = { id: updatedAgentSnapshot.id, ...updatedAgentSnapshot.data() };

    res.status(200).json(updatedAgent);
  } catch (error) {
    console.error('Error updating agent:', error);
    res.status(500).json({ error: 'Error updating agent' });
  }
});
// Delete an Agent
AgentRouter.delete('/delete/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if the agent exists
    const agentRef = doc(db, 'agents', id);
    const agentSnapshot = await getDoc(agentRef);
    if (!agentSnapshot.exists()) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    await deleteDoc(agentRef);
    res.status(200).json({ message: 'Agent deleted successfully' });
  } catch (error) {
    console.error('Error deleting agent:', error);
    res.status(500).json({ error: 'Error deleting agent' });
  }
});

// Fetch all Agents
AgentRouter.get('/', async (req, res) => {
  try {
    const agentsCollectionRef = collection(db, 'agents');
    const querySnapshot = await getDocs(agentsCollectionRef);
    const agents = [];
    
    querySnapshot.forEach((doc) => {
      agents.push({ id: doc.id, ...doc.data() }); // Include documentId in the result
    });

    res.status(200).json(agents);
  } catch (error) {
    console.error('Error fetching agents:', error);
    res.status(500).json({ error: 'Error fetching agents' });
  }
});

export default AgentRouter;
