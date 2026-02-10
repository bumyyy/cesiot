import Etat from '../model/getStatDoors.js';

// Get the monthly status
export const getStateMonth = async (req, res) => {
  try {
    const year = req.query.year;
    if (!year) {
        return res.status(400).json({ error: "Paramètre year manquant" });
    }
    Etat.getStateMonth(year, (err, results) => {
    if (err) throw err;
    res.json(results);
  });
  } catch (error) {
    res.status(500).send("Server Error : " + error.message);
  }
};

// Get the hourly status
export const getStateHour = async (req, res) => {
  try {
    Etat.getStateHour((err, results) => {
    if (err) throw err;
    res.json(results);
  });
  } catch (error) {
    res.status(500).send("Server Error : " + error.message);
  }
};

// Get the door status
export const getStateDoor = async (req, res) => {
  try { 
    Etat.getStateDoor((err, results) => {
    if (err) throw err;
    res.json(results);
  });
  } catch (error) {
    res.status(500).send("Server Error : " + error.message);
  } 
};

//Get all years available
export const getAllYears = async (req, res) => {
  try {
    Etat.getAllYears((err, results) => {
    if (err) throw err;
    res.json(results);
  });
  } catch (error) {
    res.status(500).send("Server Error : " + error.message);
  } 
};

//Get all doors
export const getDoors = async (req, res) => {
  try {
    Etat.getDoors((err, results) => {
    if (err) throw err;
    res.json(results);
  });
  } catch (error) {
    res.status(500).send("Server Error : " + error.message);
  }
};