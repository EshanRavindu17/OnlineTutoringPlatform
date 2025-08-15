import { Request,Response } from "express";
import { getAllSubjects, getAllTitles,getAllTitlesBySubject } from "../services/individualTutorService";


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
