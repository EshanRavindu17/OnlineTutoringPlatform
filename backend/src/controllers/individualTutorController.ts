import { Request,Response } from "express";
import { getAllSubjects, getAllTitles,getAllTitlesBySubject, createSubject, createTitle } from "../services/individualTutorService";


export const getAllSubjectsController = async (req: Request, res: Response) => {
  try {
    const subjects = await getAllSubjects();
    res.json(subjects);
  } catch (error) {
    console.error("Error fetching subjects:", error);
    res.status(500).json({ error: "Failed to fetch subjects" });
  }
};

export const getAllTitlesBySubjectController = async (req: Request, res: Response) => {
  const { sub_id } = req.params;
  try {
    const titles = await getAllTitlesBySubject(sub_id);
    res.json(titles);
  } catch (error) {
    console.error("Error fetching titles:", error);
    res.status(500).json({ error: "Failed to fetch titles" });
  }
};

export const getAllTitlesController = async (req: Request, res: Response) => {
  try {
    const titles = await getAllTitles();
    res.json(titles);
  } catch (error) {
    console.error("Error fetching titles:", error);
    res.status(500).json({ error: "Failed to fetch titles" });
  }
};

export const createSubjectController = async (req: Request, res: Response) => {
  const { name } = req.body;
  try {
    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Subject name is required" });
    }
    const subject = await createSubject(name.trim());
    res.status(201).json(subject);
  } catch (error) {
    console.error("Error creating subject:", error);
    res.status(500).json({ error: "Failed to create subject" });
  }
};

export const createTitleController = async (req: Request, res: Response) => {
  const { name, sub_id } = req.body;
  try {
    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Title name is required" });
    }
    if (!sub_id) {
      return res.status(400).json({ error: "Subject ID is required" });
    }
    const title = await createTitle(name.trim(), sub_id);
    res.status(201).json(title);
  } catch (error) {
    console.error("Error creating title:", error);
    res.status(500).json({ error: "Failed to create title" });
  }
};
