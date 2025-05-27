const express = require('express');
const router = express.Router();
const TankPipePen = require("../db/models/TankPipePen"); // Proje modeli
const Response = require("../lib/Response");
const CustomError = require("../lib/Error");
const Enum = require("../config/Enum");
const logger = require("../lib/logger/LoggerClass");

// Yeni Proje Ekleme (POST /tankpipepen/add)
router.post("/add", async (req, res) => {
    let body = req.body;
    try {
        if (!body.projectName || !body.columns) {
            throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "Project name and columns must be provided.");
        }

        // Aynı isimde bir proje olup olmadığını kontrol et
        const existingProject = await TankPipePen.findOne({ projectName: body.projectName });
        if (existingProject) {
            throw new CustomError(Enum.HTTP_CODES.CONFLICT, "Duplicate Error!", "Project with the same name already exists.");
        }

        // Yeni proje nesnesi oluştur
        const newProject = new TankPipePen({
            projectName: body.projectName,
            columns: body.columns,
        });

        await newProject.save();
        logger.info(req.user?.email, "TankPipePen", "Add", newProject);

        res.json(Response.successResponse(newProject));

    } catch (err) {
        logger.error(req.user?.email, "TankPipePen", "Add", err);
        let errorResponse = Response.errorResponse(err);
        res.status(errorResponse.code).json(errorResponse);
    }
});
// Tüm Projeleri Listeleme (GET /tankpipepen)
router.get("/", async (req, res) => {
    try {
        const tankpipepen = await TankPipePen.find();
        res.json(Response.successResponse(tankpipepen));
    } catch (err) {
        logger.error(req.user?.email, "TankPipePen", "List", err);
        let errorResponse = Response.errorResponse(err);
        res.status(errorResponse.code).json(errorResponse);
    }
});
router.put("/update-column/:id", async (req, res) => {
    const { id } = req.params;
    const { columns: updatedColumns } = req.body; // Gelen güncellemeleri al
  
    try {
      if (!updatedColumns || Object.keys(updatedColumns).length === 0) {
        throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "At least one column must be provided.");
      }
  
      // Projeyi veritabanından alın
      const project = await TankPipePen.findById(id);
  
      if (!project) {
        throw new CustomError(Enum.HTTP_CODES.NOT_FOUND, "Not Found", "Project not found");
      }
  
      // project.columns (Map) üzerinde güncellemeleri uygulayın
      for (const [key, value] of Object.entries(updatedColumns)) {
        project.columns.set(key, value);
      }
  
      // Güncellenmiş projeyi kaydedin
      await project.save();
  
      logger.info(req.user?.email, "TankPipePen", "Update Column", project);
      res.json(Response.successResponse(project));
  
    } catch (err) {
      logger.error(req.user?.email, "TankPipePen", "Update Column", err);
      let errorResponse = Response.errorResponse(err);
      res.status(errorResponse.code).json(errorResponse);
    }
  });
  router.put("/add-column/:id", async (req, res) => {
    const { id } = req.params;
    const { columns: newColumns } = req.body; // Yeni kolonları al
  
    try {
      if (!newColumns || Object.keys(newColumns).length === 0) {
        throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "At least one column must be provided.");
      }
  
      // Projeyi veritabanından alın
      const project = await TankPipePen.findById(id);
  
      if (!project) {
        throw new CustomError(Enum.HTTP_CODES.NOT_FOUND, "Not Found", "Project not found");
      }
  
      // Yeni kolonları mevcut kolonlara ekleyin, ancak yalnızca önceden yoksa
      for (const [key, value] of Object.entries(newColumns)) {
        if (!project.columns.has(key)) { // Kolon zaten varsa eklemeyin
          project.columns.set(key, value);
        } else {
          // İsteğe bağlı: Zaten varsa hata fırlatabilirsiniz
          // throw new CustomError(Enum.HTTP_CODES.CONFLICT, "Conflict", `Column ${key} already exists`); 
        }
      }
  
      // Güncellenmiş projeyi kaydedin
      await project.save();
  
      logger.info(req.user?.email, "TankPipePen", "Add Column", project);
      res.json(Response.successResponse(project));
  
    } catch (err) {
      logger.error(req.user?.email, "TankPipePen", "Add Column", err);
      let errorResponse = Response.errorResponse(err);
      res.status(errorResponse.code).json(errorResponse);
    }
  });



// Proje Silme (DELETE /tankpipepen/:id)
router.delete("/delete/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const project = await TankPipePen.findByIdAndDelete(id);
        if (!project) {
            throw new CustomError(Enum.HTTP_CODES.NOT_FOUND, "Not Found", "Project not found");
        }

        logger.info(req.user?.email, "TankPipePen", "Delete", { _id: id });
        res.json(Response.successResponse({ success: true, message: "Project deleted successfully" }));
    } catch (err) {
        logger.error(req.user?.email, "TankPipePen", "Delete", err);
        let errorResponse = Response.errorResponse(err);
        res.status(errorResponse.code).json(errorResponse);
    }
});

module.exports = router;
